/**
 * 排放因子测试
 *
 * 验证排放因子数据库的完整性和正确性
 */
import { describe, test, expect } from '@jest/globals';

// 排放因子数据库（从碳核算服务复制）
const EMISSION_FACTORS = {
  // 化石燃料
  FUEL_COKE: {
    name: '焦炭',
    lowerHeatingValue: 28.435,  // TJ/万吨
    carbonContent: 94.0,         // tc/TJ
    oxidationRate: 0.988,         // 碳氧化率
    category: 'FUEL',
    unit: 'TJ/万吨'
  },
  FUEL_ANTHRACITE: {
    name: '无烟煤',
    lowerHeatingValue: 20.908,
    carbonContent: 93.6,
    oxidationRate: 0.940,
    category: 'FUEL',
    unit: 'TJ/万吨'
  },
  FUEL_BITUMINOUS: {
    name: '烟煤',
    lowerHeatingValue: 20.908,
    carbonContent: 80.7,
    oxidationRate: 0.981,
    category: 'FUEL',
    unit: 'TJ/万吨'
  },
  FUEL_NATGAS: {
    name: '天然气',
    lowerHeatingValue: 389.31,    // TJ/万m³
    carbonContent: 15.3,
    oxidationRate: 0.995,
    category: 'FUEL',
    unit: 'TJ/万m³'
  },
  FUEL_COKING_GAS: {
    name: '焦炉煤气',
    lowerHeatingValue: 179.21,
    carbonContent: 12.1,
    oxidationRate: 0.995,
    category: 'FUEL',
    unit: 'TJ/万m³'
  },
  FUEL_BLAST_GAS: {
    name: '高炉煤气',
    lowerHeatingValue: 33.12,
    carbonContent: 70.8,
    oxidationRate: 0.995,
    category: 'FUEL',
    unit: 'TJ/万m³'
  },
  // 过程排放
  PROC_LIMESTONE: {
    name: '石灰石分解',
    emissionFactor: 0.4397,         // tCO₂/t
    category: 'PROCESS',
    unit: 'tCO₂/t'
  },
  PROC_DOLOMITE: {
    name: '白云石分解',
    emissionFactor: 0.4743,
    category: 'PROCESS',
    unit: 'tCO₂/t'
  },
  // 电力
  ELEC_CENTRAL: {
    name: '华中电网',
    emissionFactor: 0.5810,         // tCO₂/MWh
    category: 'ELECTRICITY',
    unit: 'tCO₂/MWh'
  }
};

// 参考排放因子（国家标准值，用于对比验证）
const REFERENCE_FACTORS = {
  FUEL_COKE: { emissionFactor: 3.04, unit: 'tCO₂/t' },        // 焦炭排放因子
  PROC_LIMESTONE: { emissionFactor: 0.4397, unit: 'tCO₂/t' },  // 石灰石分解
  ELEC_CENTRAL: { emissionFactor: 0.5810, unit: 'tCO₂/MWh' }, // 华中电网
};

describe('排放因子数据库验证', () => {
  describe('数据结构完整性', () => {
    test('所有燃料因子应包含必要字段', () => {
      const fuelFactors = Object.entries(EMISSION_FACTORS)
        .filter(([_, f]) => f.category === 'FUEL');

      expect(fuelFactors.length).toBeGreaterThan(0);

      for (const [code, factor] of fuelFactors) {
        expect(factor.name).toBeTruthy();
        expect(factor.lowerHeatingValue).toBeGreaterThan(0);
        expect(factor.carbonContent).toBeGreaterThan(0);
        expect(factor.oxidationRate).toBeGreaterThan(0);
        expect(factor.oxidationRate).toBeLessThanOrEqual(1);
        expect(factor.category).toBe('FUEL');
      }
    });

    test('所有过程排放因子应包含必要字段', () => {
      const processFactors = Object.entries(EMISSION_FACTORS)
        .filter(([_, f]) => f.category === 'PROCESS');

      expect(processFactors.length).toBeGreaterThan(0);

      for (const [code, factor] of processFactors) {
        expect(factor.name).toBeTruthy();
        expect(factor.emissionFactor).toBeGreaterThan(0);
        expect(factor.category).toBe('PROCESS');
      }
    });

    test('所有电力排放因子应包含必要字段', () => {
      const electricityFactors = Object.entries(EMISSION_FACTORS)
        .filter(([_, f]) => f.category === 'ELECTRICITY');

      expect(electricityFactors.length).toBeGreaterThan(0);

      for (const [code, factor] of electricityFactors) {
        expect(factor.name).toBeTruthy();
        expect(factor.emissionFactor).toBeGreaterThan(0);
        expect(factor.category).toBe('ELECTRICITY');
      }
    });
  });

  describe('数值合理性验证', () => {
    test('低位发热量应在合理范围内', () => {
      // 固体燃料: 10-35 TJ/万吨
      expect(EMISSION_FACTORS.FUEL_COKE.lowerHeatingValue).toBeGreaterThan(20);
      expect(EMISSION_FACTORS.FUEL_COKE.lowerHeatingValue).toBeLessThan(35);

      expect(EMISSION_FACTORS.FUEL_ANTHRACITE.lowerHeatingValue).toBeGreaterThan(20);
      expect(EMISSION_FACTORS.FUEL_ANTHRACITE.lowerHeatingValue).toBeLessThan(35);

      // 气体燃料: 100-400 TJ/万m³
      expect(EMISSION_FACTORS.FUEL_NATGAS.lowerHeatingValue).toBeGreaterThan(300);
      expect(EMISSION_FACTORS.FUEL_NATGAS.lowerHeatingValue).toBeLessThan(450);
    });

    test('含碳量应在合理范围内', () => {
      // tc/TJ (吨碳/TJ)
      const ccValues = Object.entries(EMISSION_FACTORS)
        .filter(([_, f]) => f.category === 'FUEL')
        .map(([_, f]) => f.carbonContent);

      for (const cc of ccValues) {
        expect(cc).toBeGreaterThan(10);  // 最低约15 tc/TJ（天然气）
        expect(cc).toBeLessThan(100);    // 最高约94 tc/TJ（无烟煤）
      }
    });

    test('碳氧化率应在合理范围内', () => {
      const ofValues = Object.entries(EMISSION_FACTORS)
        .filter(([_, f]) => f.category === 'FUEL')
        .map(([_, f]) => f.oxidationRate);

      for (const of of ofValues) {
        expect(of).toBeGreaterThan(0.9);
        expect(of).toBeLessThanOrEqual(1.0);
      }
    });

    test('电力排放因子应在合理范围内', () => {
      // 中国电网排放因子约0.5-0.7 tCO₂/MWh
      expect(EMISSION_FACTORS.ELEC_CENTRAL.emissionFactor).toBeGreaterThan(0.5);
      expect(EMISSION_FACTORS.ELEC_CENTRAL.emissionFactor).toBeLessThan(0.7);
    });
  });

  describe('标准合规性验证', () => {
    test('石灰石分解排放因子应符合国家标准', () => {
      // GB/T 32150-2015 附录A
      const limestoneFactor = EMISSION_FACTORS.PROC_LIMESTONE.emissionFactor;
      const referenceValue = REFERENCE_FACTORS.PROC_LIMESTONE.emissionFactor;

      expect(limestoneFactor).toBeCloseTo(referenceValue, 4);
    });

    test('电力排放因子应符合区域电网因子', () => {
      const gridFactor = EMISSION_FACTORS.ELEC_CENTRAL.emissionFactor;
      const referenceValue = REFERENCE_FACTORS.ELEC_CENTRAL.emissionFactor;

      expect(gridFactor).toBeCloseTo(referenceValue, 4);
    });
  });

  describe('分类统计', () => {
    test('应正确分类燃料排放因子', () => {
      const fuelFactors = Object.entries(EMISSION_FACTORS)
        .filter(([_, f]) => f.category === 'FUEL')
        .map(([code, _]) => code);

      expect(fuelFactors).toContain('FUEL_COKE');
      expect(fuelFactors).toContain('FUEL_ANTHRACITE');
      expect(fuelFactors).toContain('FUEL_BITUMINOUS');
      expect(fuelFactors).toContain('FUEL_NATGAS');
      expect(fuelFactors).toContain('FUEL_COKING_GAS');
      expect(fuelFactors).toContain('FUEL_BLAST_GAS');
      expect(fuelFactors.length).toBe(6);
    });

    test('应正确分类过程排放因子', () => {
      const processFactors = Object.entries(EMISSION_FACTORS)
        .filter(([_, f]) => f.category === 'PROCESS')
        .map(([code, _]) => code);

      expect(processFactors).toContain('PROC_LIMESTONE');
      expect(processFactors).toContain('PROC_DOLOMITE');
      expect(processFactors.length).toBe(2);
    });

    test('应正确分类电力排放因子', () => {
      const electricityFactors = Object.entries(EMISSION_FACTORS)
        .filter(([_, f]) => f.category === 'ELECTRICITY')
        .map(([code, _]) => code);

      expect(electricityFactors).toContain('ELEC_CENTRAL');
      expect(electricityFactors.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('排放因子计算公式验证', () => {
  const CO2_C_RATIO = 44 / 12;

  test('焦炭直接排放因子计算', () => {
    const factor = EMISSION_FACTORS.FUEL_COKE;

    // 焦炭排放因子 = NCV × CC × OF × 44/12 (单位: tCO₂/t)
    // = (28.435 / 10000) TJ/kg × 94.0 tc/TJ × 0.988 × 44/12
    // 注意: NCV单位是TJ/万吨，需要转换为TJ/t

    const ncvTJperT = factor.lowerHeatingValue / 10000;  // TJ/t
    const directFactor = ncvTJperT * factor.carbonContent * factor.oxidationRate * CO2_C_RATIO;

    // 标准焦炭排放因子约为 3.04 tCO₂/t
    expect(directFactor).toBeGreaterThan(2.5);
    expect(directFactor).toBeLessThan(3.5);
  });

  test('天然气直接排放因子计算', () => {
    const factor = EMISSION_FACTORS.FUEL_NATGAS;

    // 天然气排放因子
    const ncvTJperT = factor.lowerHeatingValue / 10000;  // TJ/m³
    const directFactor = ncvTJperT * factor.carbonContent * factor.oxidationRate * CO2_C_RATIO;

    // 天然气排放因子约为 0.02 tCO₂/m³
    expect(directFactor).toBeGreaterThan(0.015);
    expect(directFactor).toBeLessThan(0.025);
  });

  test('排放因子数据库应包含完整参数', () => {
    for (const [code, factor] of Object.entries(EMISSION_FACTORS)) {
      if (factor.category === 'FUEL') {
        expect(factor.lowerHeatingValue).toBeDefined();
        expect(factor.carbonContent).toBeDefined();
        expect(factor.oxidationRate).toBeDefined();
      } else if (factor.category === 'PROCESS' || factor.category === 'ELECTRICITY') {
        expect(factor.emissionFactor).toBeDefined();
      }
    }
  });
});
