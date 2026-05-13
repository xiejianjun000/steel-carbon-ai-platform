/**
 * 碳排放计算引擎
 * 依据GB/T 32150-2025标准实现
 */

/** CO₂与C的分子量之比 */
const CO2_C_RATIO = 44 / 12;

/** 默认排放因子数据库 */
const EMISSION_FACTORS: Record<string, {
  name: string;
  lowerHeatingValue?: number;  // 低位发热量 (TJ/万吨 或 TJ/万m³)
  carbonContent?: number;      // 含碳量 (tc/TJ)
  oxidationRate?: number;      // 碳氧化率
  emissionFactor?: number;     // 排放因子 (tCO₂/t 或 tCO₂/MWh)，与shared保持一致
  unit: string;
}> = {
  // ---- 化石燃料 ----
  FUEL_COKE:        { name: '焦炭',    lowerHeatingValue: 28.435,  carbonContent: 94.0, oxidationRate: 0.988, unit: 'TJ/万吨' },
  FUEL_ANTHRACITE:  { name: '无烟煤',  lowerHeatingValue: 20.908,  carbonContent: 93.6, oxidationRate: 0.940, unit: 'TJ/万吨' },
  FUEL_BITUMINOUS:  { name: '烟煤',    lowerHeatingValue: 20.908,  carbonContent: 80.7, oxidationRate: 0.981, unit: 'TJ/万吨' },
  FUEL_NATGAS:      { name: '天然气',  lowerHeatingValue: 389.31,  carbonContent: 15.3, oxidationRate: 0.995, unit: 'TJ/万m³' },
  FUEL_COKING_GAS:  { name: '焦炉煤气', lowerHeatingValue: 179.21, carbonContent: 12.1, oxidationRate: 0.995, unit: 'TJ/万m³' },
  FUEL_BLAST_GAS:   { name: '高炉煤气', lowerHeatingValue: 33.12,  carbonContent: 70.8, oxidationRate: 0.995, unit: 'TJ/万m³' },

  // ---- 过程排放 ----
  PROC_LIMESTONE:   { name: '石灰石分解', emissionFactor: 0.4397, unit: 'tCO₂/t' },
  PROC_DOLOMITE:    { name: '白云石分解', emissionFactor: 0.4743, unit: 'tCO₂/t' },

  // ---- 电力 ----
  ELEC_CENTRAL:     { name: '华中电网',   emissionFactor: 0.5810, unit: 'tCO₂/MWh' },
};

/** 工序配置 */
const PROCESSES = [
  { id: 1, name: '烧结', code: 'SINTERING' },
  { id: 2, name: '炼铁', code: 'IRONMAKING' },
  { id: 3, name: '炼钢', code: 'STEELMAKING' },
  { id: 4, name: '轧钢', code: 'ROLLING' },
  { id: 5, name: '焦化', code: 'COKING' },
];

/**
 * 化石燃料燃烧排放计算
 * 公式：E_i = AD_i × NCV_i × CC_i × OF_i × (44/12)
 * 其中 NCV_i 需要从 TJ/万吨 转换为 TJ/t（÷10000）
 */
export function calculateFuelEmission(
  fuelCode: string,
  consumption: number  // 消耗量（万吨/万m³）
): { emission: number; detail: Record<string, number> } {
  const factor = EMISSION_FACTORS[fuelCode];
  if (!factor) throw new Error(`未知的燃料类型: ${fuelCode}`);

  const ncv = (factor.lowerHeatingValue || 0) / 10000;  // 转为 TJ/t
  const cc = factor.carbonContent || 0;                   // tc/TJ
  const of = factor.oxidationRate || 0;                  // 氧化率

  const emission = consumption * ncv * cc * of * CO2_C_RATIO;

  return {
    emission,
    detail: {
      consumption,         // 消耗量（万吨）
      lowerHeatingValue: ncv, // 低位发热量 (TJ/t)
      carbonContent: cc,   // 含碳量 (tc/TJ)
      oxidationRate: of,   // 氧化率
      co2cRatio: CO2_C_RATIO,
    },
  };
}

/**
 * 过程排放计算
 * 公式：E = AD × EF
 */
export function calculateProcessEmission(
  processCode: string,
  consumption: number  // 消耗量（吨）
): { emission: number; detail: Record<string, number> } {
  const factor = EMISSION_FACTORS[processCode];
  if (!factor || !factor.emissionFactor) throw new Error(`未知的过程排放源: ${processCode}`);

  const emission = consumption * factor.emissionFactor;

  return {
    emission,
    detail: {
      consumption,
      emissionFactor: factor.emissionFactor,
    },
  };
}

/**
 * 净购入电力排放计算
 * 公式：E = AD_电力(kWh) × EF_电网(tCO₂/MWh) / 1000
 * 注意：AD以万kWh为单位时，先转kWh
 */
export function calculateElectricityEmission(
  gridCode: string,
  purchasedPower: number  // 购入电量（万kWh）
): { emission: number; detail: Record<string, number> } {
  const factor = EMISSION_FACTORS[gridCode];
  if (!factor || !factor.emissionFactor) throw new Error(`未知的电网: ${gridCode}`);

  // 万kWh → kWh → MWh
  const powerMWh = purchasedPower * 10000;
  const emission = powerMWh * factor.emissionFactor / 1000;  // tCO₂

  return {
    emission,
    detail: {
      purchasedPower,
      powerMWh,
      gridFactor: factor.emissionFactor,
    },
  };
}

/**
 * 活动数据条目
 */
export interface ActivityItem {
  fuelCode: string;
  processId: number;
  consumption: number;
  emissionType: 'FUEL' | 'PROCESS' | 'ELECTRICITY';
}

/**
 * 执行完整碳排放核算
 */
export function performCalculation(
  periodMonth: string,
  activityItems: ActivityItem[]
) {
  let totalFuel = 0;
  let totalProcess = 0;
  let totalElectricity = 0;
  const details: any[] = [];
  const byProcess: Record<number, { name: string; emission: number; fuel: number; process: number; electricity: number }> = {};

  // 初始化工序统计
  PROCESSES.forEach((p) => {
    byProcess[p.id] = { name: p.name, emission: 0, fuel: 0, process: 0, electricity: 0 };
  });

  for (const item of activityItems) {
    try {
      if (item.emissionType === 'FUEL') {
        const result = calculateFuelEmission(item.fuelCode, item.consumption);
        totalFuel += result.emission;
        details.push({ ...result, type: 'FUEL', fuelCode: item.fuelCode, processId: item.processId });
        if (byProcess[item.processId]) {
          byProcess[item.processId].fuel += result.emission;
          byProcess[item.processId].emission += result.emission;
        }
      } else if (item.emissionType === 'PROCESS') {
        const result = calculateProcessEmission(item.fuelCode, item.consumption);
        totalProcess += result.emission;
        details.push({ ...result, type: 'PROCESS', fuelCode: item.fuelCode, processId: item.processId });
        if (byProcess[item.processId]) {
          byProcess[item.processId].process += result.emission;
          byProcess[item.processId].emission += result.emission;
        }
      } else if (item.emissionType === 'ELECTRICITY') {
        const result = calculateElectricityEmission(item.fuelCode, item.consumption);
        totalElectricity += result.emission;
        details.push({ ...result, type: 'ELECTRICITY', fuelCode: item.fuelCode, processId: item.processId });
        if (byProcess[item.processId]) {
          byProcess[item.processId].electricity += result.emission;
          byProcess[item.processId].emission += result.emission;
        }
      }
    } catch (err: any) {
      details.push({ error: err.message, fuelCode: item.fuelCode, processId: item.processId });
    }
  }

  const totalEmission = totalFuel + totalProcess + totalElectricity;

  return {
    periodMonth,
    totalEmission,
    unit: 'tCO₂',
    breakdown: {
      fuel: totalFuel,
      process: totalProcess,
      electricity: totalElectricity,
    },
    byProcess: Object.entries(byProcess).map(([id, data]) => ({
      processId: parseInt(id),
      processName: data.name,
      emission: data.emission,
      intensity: 0,
    })),
    details,
    calculationId: `calc_${periodMonth.replace('-', '')}_001`,
  };
}

/**
 * 获取所有排放因子
 */
export function getAllFactors() {
  return Object.entries(EMISSION_FACTORS).map(([code, factor]) => ({
    code,
    ...factor,
    category: code.startsWith('FUEL') ? 'FUEL' : code.startsWith('PROC') ? 'PROCESS' : 'ELECTRICITY',
  }));
}

/**
 * 获取指定类别的排放因子
 */
export function getFactorsByCategory(category: string) {
  const prefix = category === 'FUEL' ? 'FUEL' : category === 'PROCESS' ? 'PROC' : 'ELEC';
  return Object.entries(EMISSION_FACTORS)
    .filter(([code]) => code.startsWith(prefix))
    .map(([code, factor]) => ({ code, ...factor }));
}
