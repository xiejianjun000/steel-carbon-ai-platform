/**
 * 控制面板API服务
 * 冷钢碳排放AI智慧管理平台
 */
import api from '../../../services/api';
import type {
  AgentStatus,
  ChatMessage,
  DataSyncStatus,
  TaskDispatchRequest,
  TaskDispatchResult,
} from '../types/controlPanel';

/** 获取所有智能体状态 */
export const getAgentStatus = (): Promise<AgentStatus[]> => {
  return api.get('/agent/status');
};

/** 获取单个智能体状态 */
export const getAgentStatusById = (agentId: number): Promise<AgentStatus> => {
  return api.get(`/agent/${agentId}/status`);
};

/** 发送对话消息 */
export const sendChatMessage = (
  message: string,
  conversationId?: string,
  agentRole?: string
): Promise<{
  answer: string;
  agent_used: string;
  sources: any[];
  conversation_id: string;
  task_progress?: any[];
}> => {
  return api.post('/chat/completion', {
    message,
    conversation_id: conversationId,
    agent_role: agentRole,
  });
};

/** 分发任务给指定智能体 */
export const dispatchTask = (request: TaskDispatchRequest): Promise<TaskDispatchResult> => {
  return api.post('/agent/dispatch', request);
};

/** 批量分发任务（多智能体协同） */
export const dispatchMultiTask = (
  requests: TaskDispatchRequest[]
): Promise<TaskDispatchResult[]> => {
  return api.post('/agent/dispatch/batch', { tasks: requests });
};

/** 获取数据同步状态 */
export const getDataSyncStatus = (date?: string): Promise<DataSyncStatus[]> => {
  return api.get('/data/sync/status', { params: { date } });
};

/** 手动触发数据同步 */
export const triggerDataSync = (processIds?: number[]): Promise<{
  taskId: string;
  status: string;
  estimatedTime: number;
}> => {
  return api.post('/data/sync/trigger', { process_ids: processIds });
};

/** 获取同步历史 */
export const getSyncHistory = (
  page: number = 1,
  pageSize: number = 20
): Promise<{
  items: any[];
  total: number;
  page: number;
  pageSize: number;
}> => {
  return api.get('/data/sync/history', { params: { page, page_size: pageSize } });
};

/** 获取对话历史 */
export const getConversationHistory = (
  conversationId: string,
  page: number = 1,
  pageSize: number = 50
): Promise<{
  messages: ChatMessage[];
  total: number;
}> => {
  return api.get(`/chat/history/${conversationId}`, {
    params: { page, page_size: pageSize },
  });
};

/** 获取当前会话 */
export const getCurrentConversation = (): Promise<{
  conversationId: string;
  messages: ChatMessage[];
  context: any;
}> => {
  return api.get('/chat/current');
};

/** 上报数据到指定智能体 */
export const uploadDataToAgent = (
  agentId: number,
  data: Record<string, any>
): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> => {
  return api.post(`/agent/${agentId}/upload`, { data });
};

/** 生成日报 */
export const generateDailyReport = (
  date: string,
  processIds?: number[]
): Promise<{
  reportId: string;
  status: string;
  downloadUrl?: string;
}> => {
  return api.post('/report/daily', { date, process_ids: processIds });
};

/** 获取快捷操作列表 */
export const getQuickActions = (): Promise<{
  actions: {
    id: string;
    name: string;
    icon: string;
    description: string;
    agentId?: number;
  }[];
}> => {
  return api.get('/system/quick-actions');
};
