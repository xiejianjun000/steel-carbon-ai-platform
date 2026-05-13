import api from './api';

// 智能问答
export const askQuestion = (data: {
  question: string;
  conversationId?: string;
}) => api.post('/knowledge/ask', data);

// 获取知识库文档列表
export const getDocuments = (params?: {
  category?: string;
  page?: number;
  pageSize?: number;
}) => api.get('/knowledge/documents', { params });

// 上传知识库文档
export const uploadDocument = (formData: FormData) =>
  api.post('/knowledge/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
