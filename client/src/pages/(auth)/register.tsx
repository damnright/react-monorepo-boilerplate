import React from 'react';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useNavigate } from '@tanstack/react-router';

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          用户注册
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
          创建新账户以开始使用我们的服务
        </Typography>
        
        <RegisterForm />
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            已有账户？
            <Button 
              variant="text" 
              onClick={() => navigate({ to: '/auth/login' })}
              sx={{ ml: 1 }}
            >
              立即登录
            </Button>
          </Typography>
          <Button 
            variant="text" 
            onClick={() => navigate({ to: '/' })}
            sx={{ mt: 2 }}
          >
            返回首页
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 