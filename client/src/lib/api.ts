import axios from 'axios';
import type { 
  LoginDTO, 
  RegisterDTO, 
  UserQueryDTO, 
  ActivityQueryDTO,
  UserInfo,
  AuthResponse,
  PaginatedResponse,
  StatsResponse,
  SystemInfoResponse,
  ChartResponse
} from 'common';

// 创建axios实例
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5055/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加请求前的逻辑，比如显示loading
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 移除直接的认证处理，交给useAuth处理
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401错误由useAuth hook统一处理，这里只传递错误
    return Promise.reject(error);
  }
);

// API 方法
export const authAPI = {
  login: (data: LoginDTO) =>
    api.post<AuthResponse>('/auth/login', data),
  
  register: (data: RegisterDTO) =>
    api.post<AuthResponse>('/auth/register', data),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get<UserInfo>('/auth/me'),
  
  refreshToken: () => api.post('/auth/refresh'),
};

export const userAPI = {
  getUsers: (params?: UserQueryDTO) =>
    api.get<PaginatedResponse<UserInfo>>('/users', { params }),
  
  getUser: (id: string) => 
    api.get<UserInfo>(`/users/${id}`),
  
  createUser: (userData: Partial<UserInfo>) => 
    api.post<UserInfo>('/users', userData),
  
  updateUser: (id: string, userData: Partial<UserInfo>) => 
    api.put<UserInfo>(`/users/${id}`, userData),
  
  deleteUser: (id: string) => 
    api.delete(`/users/${id}`),
  
  changePassword: (id: string, oldPassword: string, newPassword: string) =>
    api.put(`/users/${id}/password`, { oldPassword, newPassword }),
};

export const adminAPI = {
  getStats: () => 
    api.get<StatsResponse>('/admin/stats'),
  
  getActivities: (params?: ActivityQueryDTO) =>
    api.get<PaginatedResponse<any>>('/admin/activities', { params }),
  
  getSystemInfo: () => 
    api.get<SystemInfoResponse>('/admin/system'),
  
  getChartData: (type: string, period: string) =>
    api.get<ChartResponse>(`/admin/charts/${type}`, { params: { period } }),
}; 