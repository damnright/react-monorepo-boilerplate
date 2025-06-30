import axios from 'axios';

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

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 统一错误处理
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储
      localStorage.removeItem('auth-storage');
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  }
);

// API 方法
export const authAPI = {
  login: (email: string, password: string, rememberMe?: boolean) =>
    api.post('/auth/login', { email, password, rememberMe }),
  
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get('/auth/me'),
  
  refreshToken: () => api.post('/auth/refresh'),
};

export const userAPI = {
  getUsers: (params?: { page?: number; limit?: number; role?: string; status?: string }) =>
    api.get('/users', { params }),
  
  getUser: (id: string) => api.get(`/users/${id}`),
  
  createUser: (userData: any) => api.post('/users', userData),
  
  updateUser: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  
  changePassword: (id: string, oldPassword: string, newPassword: string) =>
    api.put(`/users/${id}/password`, { oldPassword, newPassword }),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  
  getActivities: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/activities', { params }),
  
  getSystemInfo: () => api.get('/admin/system'),
  
  getChartData: (type: string, period: string) =>
    api.get(`/admin/charts/${type}`, { params: { period } }),
}; 