import api from './api';

// 获取监控仪表盘数据
export const getMonitorDashboard = (params?: { periodMonth?: string }) =>
  api.get('/monitor/dashboard', { params });

// 获取实时排放数据
export const getRealtimeData = (params: { processId?: number }) =>
  api.get('/monitor/realtime', { params });

// 获取预警列表
export const getAlerts = (params?: {
  level?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) => api.get('/monitor/alerts', { params });

// 处理预警
export const resolveAlert = (id: number, data: { resolution: string }) =>
  api.put(`/monitor/alerts/${id}/resolve`, data);
