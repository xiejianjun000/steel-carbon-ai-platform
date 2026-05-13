import api from './api';

// 获取活动数据列表
export const getActivityData = (params: {
  periodMonth: string;
  processId?: number;
  page?: number;
  pageSize?: number;
}) => api.get('/carbon/activity-data', { params });

// 导入活动数据（Excel）
export const importActivityData = (formData: FormData) =>
  api.post('/carbon/activity-data/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// 执行碳排放计算
export const calculateEmission = (params: {
  periodMonth: string;
  processIds: number[];
  calculationMethod?: string;
}) => api.post('/carbon/calculate', params);

// 获取排放结果汇总
export const getEmissionSummary = (params: {
  periodStart: string;
  periodEnd: string;
  groupBy?: string;
}) => api.get('/carbon/emission-result/summary', { params });

// 获取排放因子列表
export const getEmissionFactors = (params?: { category?: string }) =>
  api.get('/carbon/emission-factors', { params });
