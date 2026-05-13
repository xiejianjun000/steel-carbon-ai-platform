/**
 * 默认排放因子常量（依据GB/T 32150-2025标准）
 */
export const DEFAULT_EMISSION_FACTORS = {
  // 化石燃料排放因子
  FUEL_COKE: { name: '焦炭', lowerHeatingValue: 28.435, carbonContent: 94.0, oxidationRate: 0.988, unit: 'TJ/万吨' },
  FUEL_ANTHRACITE: { name: '无烟煤', lowerHeatingValue: 20.908, carbonContent: 93.6, oxidationRate: 0.940, unit: 'TJ/万吨' },
  FUEL_BITUMINOUS: { name: '烟煤', lowerHeatingValue: 20.908, carbonContent: 80.7, oxidationRate: 0.981, unit: 'TJ/万吨' },
  FUEL_NATGAS: { name: '天然气', lowerHeatingValue: 389.31, carbonContent: 15.3, oxidationRate: 0.995, unit: 'TJ/万m³' },
  FUEL_COKING_GAS: { name: '焦炉煤气', lowerHeatingValue: 179.21, carbonContent: 12.1, oxidationRate: 0.995, unit: 'TJ/万m³' },
  FUEL_BLAST_GAS: { name: '高炉煤气', lowerHeatingValue: 33.12, carbonContent: 70.8, oxidationRate: 0.995, unit: 'TJ/万m³' },

  // 过程排放因子
  PROC_LIMESTONE: { name: '石灰石分解', emissionFactor: 0.4397, unit: 'tCO₂/t' },
  PROC_DOLOMITE: { name: '白云石分解', emissionFactor: 0.4743, unit: 'tCO₂/t' },

  // 电力排放因子
  ELEC_CENTRAL: { name: '华中电网', emissionFactor: 0.5810, unit: 'tCO₂/MWh' },
} as const;

/**
 * CO₂与C的分子量之比
 */
export const CO2_C_RATIO = 44 / 12;

/**
 * 角色权限常量
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  CARBON_MANAGER: 'CARBON_MANAGER',
  ENERGY_OPERATOR: 'ENERGY_OPERATOR',
  PRODUCTION_SCHEDULER: 'PRODUCTION_SCHEDULER',
  FINANCE: 'FINANCE',
  VIEWER: 'VIEWER',
} as const;
