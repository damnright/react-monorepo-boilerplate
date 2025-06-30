// This file will contain shared API/DTO types.
export interface ApiErrorResponse {
  code: string;
  message: string;
  timestamp: string;
  stack?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiErrorResponse;
}

// 基础响应类型
export interface BaseResponse {
  success: boolean;
  message?: string;
}

export interface ErrorResponse extends BaseResponse {
  success: false;
  error: string;
  message: string;
  details?: any;
}

export interface SuccessResponse<T = any> extends BaseResponse {
  success: true;
  data: T;
}

// 分页响应
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  pagination: PaginationInfo;
}

// 用户相关响应
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserInfo;
  token: string;
}

// 活动记录响应
export interface ActivityInfo {
  id: string;
  type: string;
  description: string;
  metadata?: Record<string, any>;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

// 统计数据响应
export interface StatsResponse {
  users: {
    total: number;
    active: number;
    admins: number;
    newThisMonth: number;
  };
  activities: {
    todayLogins: number;
    todayRegistrations: number;
    recentActivities: ActivityInfo[];
  };
  system: {
    uptime: number;
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

// 图表数据响应
export interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
}

export interface ChartResponse {
  labels: string[];
  datasets: ChartDataset[];
}

// 系统信息响应
export interface SystemInfoResponse {
  server: {
    nodeVersion: string;
    platform: string;
    arch: string;
    uptime: number;
    environment: string;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  database: {
    status: string;
    version: string;
  };
}

// 健康检查响应
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
}