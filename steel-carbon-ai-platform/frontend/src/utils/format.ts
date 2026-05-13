/**
 * 数字格式化工具
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  if (num == null || isNaN(num)) return '-';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * 百分比格式化
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * 排放类型标签映射
 */
export const emissionTypeLabel: Record<string, string> = {
  FUEL: '燃料燃烧排放',
  PROCESS: '过程排放',
  ELECTRICITY: '净购入电力排放',
};

/**
 * 数据来源标签映射
 */
export const dataSourceLabel: Record<string, string> = {
  MANUAL: '手工录入',
  EXCEL: 'Excel导入',
  EMS: 'EMS系统',
  CEMS: 'CEMS系统',
};

/**
 * 预警级别颜色
 */
export const alertLevelColor: Record<string, string> = {
  BLUE: '#1565c0',
  YELLOW: '#f57f17',
  RED: '#c62828',
};

/**
 * 预警状态标签
 */
export const alertStatusLabel: Record<string, string> = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  RESOLVED: '已处理',
  CLOSED: '已关闭',
};
