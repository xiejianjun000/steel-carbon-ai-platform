/**
 * 统一API响应格式
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
  traceId: string;
}

/**
 * 分页响应格式
 */
export interface PageResponse<T = any> {
  total: number;
  page: number;
  pageSize: number;
  list: T[];
}

/**
 * 活动数据
 */
export interface ActivityData {
  id?: number;
  sourceId?: number;
  processId: number;
  paramCode: string;
  paramName: string;
  value: number;
  unit: string;
  periodMonth: string;
  dataSource: 'MANUAL' | 'EXCEL' | 'EMS' | 'CEMS';
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED';
  remark?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 排放因子
 */
export interface EmissionFactor {
  id?: number;
  name: string;
  code: string;
  category: 'FUEL' | 'PROCESS' | 'ELECTRICITY';
  value: number;
  unit: string;
  sourceType: 'NATIONAL' | 'INDUSTRY' | 'CUSTOM' | 'DEFAULT';
  standardRef?: string;
  version: number;
  effectiveDate: string;
  expireDate?: string;
  lowerHeatingValue?: number;
  carbonContent?: number;
  oxidationRate?: number;
}

/**
 * 碳排放计算结果
 */
export interface EmissionResult {
  id?: number;
  activityDataId: number;
  factorId: number;
  processId: number;
  activityValue: number;
  factorValue: number;
  emissionValue: number;
  emissionType: 'FUEL' | 'PROCESS' | 'ELECTRICITY';
  calculationMethod: string;
  calculationDetail: Record<string, any>;
  periodMonth: string;
  createdAt?: string;
}

/**
 * 碳排放计算请求
 */
export interface CalculationRequest {
  periodMonth: string;
  processIds: number[];
  calculationMethod?: string;
}

/**
 * 碳排放计算响应
 */
export interface CalculationResponse {
  periodMonth: string;
  totalEmission: number;
  unit: string;
  breakdown: {
    fuel: number;
    process: number;
    electricity: number;
  };
  byProcess: Array<{
    processId: number;
    processName: string;
    emission: number;
    intensity: number;
  }>;
  calculationId: string;
}

/**
 * 预警
 */
export interface Alert {
  id?: number;
  processId?: number;
  alertType: 'THRESHOLD' | 'TREND' | 'YOY' | 'AI_PREDICT';
  level: 'BLUE' | 'YELLOW' | 'RED';
  title: string;
  description: string;
  status: 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'CLOSED';
  ruleConfig: Record<string, any>;
  triggeredAt: string;
  resolvedAt?: string;
  resolvedBy?: number;
  resolution?: string;
}

/**
 * 用户
 */
export interface User {
  id: number;
  username: string;
  realName?: string;
  email?: string;
  phone?: string;
  roles: string[];
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: User;
}

/**
 * 错误码
 */
export const ErrorCode = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  AI_SERVICE_UNAVAILABLE: 503,
} as const;
