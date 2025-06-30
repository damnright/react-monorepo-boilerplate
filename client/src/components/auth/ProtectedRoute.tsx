import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // 显示加载状态
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 未登录则重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }

  // 检查角色权限
  if (requiredRole && user?.role !== requiredRole) {
    // 如果需要管理员权限但用户不是管理员，重定向到首页
    return <Navigate to="/" />;
  }

  return <>{children}</>;
} 