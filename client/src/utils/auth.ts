import { api } from '@/lib/api';

/**
 * 设置API认证token
 */
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

/**
 * 清除认证信息
 */
export function clearAuth() {
  setAuthToken(null);
  // 不直接操作localStorage，让zustand处理
}

/**
 * 处理认证错误
 */
export function handleAuthError() {
  clearAuth();
  // 触发路由跳转应该由组件层处理，不在这里直接操作window.location
  return { shouldRedirect: true, redirectTo: '/auth/login' };
} 