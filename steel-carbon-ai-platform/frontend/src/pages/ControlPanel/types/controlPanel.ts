/**
 * 控制面板类型定义
 * 冷钢碳排放AI智慧管理平台
 */

/** 智能体状态 */
export type AgentStatusType = 'idle' | 'working' | 'error' | 'offline';

/** 智能体类别 */
export type AgentCategory = 'process' | 'support' | 'master';

/** 智能体信息 */
export interface AgentStatus {
  id: number;
  name: string;
  description: string;
  category: AgentCategory;
  status: AgentStatusType;
  lastActive: string;
  currentTask?: string;
  metrics?: {
    tasksToday: number;
    successRate: number;
    avgResponseTime: number;
  };
}

/** 消息角色 */
export type MessageRole = 'user' | 'agent' | 'system' | 'master';

/** 任务进度 */
export interface TaskProgress {
  taskId: string;
  agentId: number;
  agentName: string;
  description: string;
  status: 'pending' | 'working' | 'done' | 'failed';
  result?: any;
  error?: string;
}

/** 聊天消息 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  agentId?: number;
  agentName?: string;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  taskProgress?: TaskProgress[];
}

/** 附件 */
export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'data';
  name: string;
  url: string;
  size?: number;
}

/** 数据同步状态 */
export interface DataSyncStatus {
  date: string;
  processId: number;
  processName: string;
  status: 'synced' | 'pending' | 'error' | 'partial';
  autoRate: number;
  manualCount: number;
  anomalyCount: number;
  lastSyncTime: string;
}

/** 快捷操作 */
export interface QuickAction {
  id: string;
  name: string;
  icon: string;
  description: string;
  action: () => void;
}

/** 对话上下文 */
export interface ConversationContext {
  conversationId: string;
  userId: string;
  currentAgent: number;
  activeAgents: number[];
  messages: ChatMessage[];
  context: {
    dateRange?: [string, string];
    processIds?: number[];
    dataStatus?: DataSyncStatus[];
  };
}

/** 任务分发请求 */
export interface TaskDispatchRequest {
  agentId: number;
  params: Record<string, any>;
  conversationId?: string;
}

/** 任务分发结果 */
export interface TaskDispatchResult {
  taskId: string;
  agentId: number;
  agentName: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

/** 智能体定义（冷钢5大工序 + 5支撑体系 + 1大管家） */
export const AGENTS: Omit<AgentStatus, 'status' | 'lastActive' | 'currentTask' | 'metrics'>[] = [
  // 主控智能体
  {
    id: 12,
    name: '大管家',
    description: '统一调度入口、多智能体协同路由、任务分发与结果汇总',
    category: 'master',
  },
  // 工序专家（无电炉，冷钢只有5大工序）
  {
    id: 1,
    name: '石灰窑',
    description: '煅烧工艺优化、石灰石分解核算、产能优化',
    category: 'process',
  },
  {
    id: 2,
    name: '烧结',
    description: '烧结机工艺诊断、配料优化、余热回收',
    category: 'process',
  },
  {
    id: 3,
    name: '高炉',
    description: '高炉炉况诊断、焦比/燃料比优化、TRT发电管理',
    category: 'process',
  },
  {
    id: 4,
    name: '转炉',
    description: '转炉冶炼优化、煤气回收、少渣冶炼',
    category: 'process',
  },
  {
    id: 6,
    name: '轧钢',
    description: '轧线加热炉优化、控轧控冷、成材率提升',
    category: 'process',
  },
  // 支撑体系
  {
    id: 7,
    name: '碳核算引擎',
    description: '5大工序精准核算、Scope 1/2/3分类、排放因子管理',
    category: 'support',
  },
  {
    id: 8,
    name: '双碳合规',
    description: '93项检查点自动审查、法规实时解读、合规差距分析',
    category: 'support',
  },
  {
    id: 9,
    name: '数据采集',
    description: '手工录入+自动采集双模式、数据校验、多源数据归一化',
    category: 'support',
  },
  {
    id: 10,
    name: '知识库',
    description: '政策文档库、技术标准库、碳排放因子库',
    category: 'support',
  },
  {
    id: 11,
    name: '运维保障',
    description: '7×24系统监控、故障应急、安全补丁、性能优化',
    category: 'support',
  },
];

/** 工序名称映射 */
export const PROCESS_NAMES: Record<number, string> = {
  1: '石灰窑',
  2: '烧结',
  3: '高炉',
  4: '转炉',
  6: '轧钢',
};
