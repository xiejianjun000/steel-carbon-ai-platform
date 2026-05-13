import api from './api';

// 登录
export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password });

// 登出
export const logout = () => api.post('/auth/logout');

// 获取当前用户信息
export const getCurrentUser = () => api.get('/auth/me');
