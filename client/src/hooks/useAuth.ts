import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, authAPI } from '@/lib/api';
import React from 'react';
import type { UserInfo, LoginDTO, RegisterDTO } from 'common';

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (data: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<UserInfo>) => void;
}

const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      // Actions
      login: async (data: LoginDTO) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.login(data);
          const { user, token } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // 设置API默认header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || '登录失败',
          });
          throw error;
        }
      },

      register: async (data: RegisterDTO) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.register(data);
          const { user, token } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // 设置API默认header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || '注册失败',
          });
          throw error;
        }
      },

      logout: () => {
        // 清除API header
        delete api.defaults.headers.common['Authorization'];
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          return;
        }

        set({ isLoading: true });

        try {
          // 设置API header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await authAPI.me();
          const user = response.data;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Token无效，清除认证状态
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          delete api.defaults.headers.common['Authorization'];
        }
      },

      updateUser: (userData: Partial<UserInfo>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useAuth = () => {
  const authState = useAuthStore();

  // 初始化时检查认证状态和设置token
  React.useEffect(() => {
    const { token } = authState;
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    authState.checkAuth();
  }, []);

  return authState;
}; 