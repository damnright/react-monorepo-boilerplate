import React from 'react';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { LoginForm } from '@/components/auth/LoginForm';
import { useNavigate } from '@tanstack/react-router';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          用户登录
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
          请输入您的账户信息进行登录
        </Typography>
        
        <LoginForm />
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            还没有账户？
            <Button 
              variant="text" 
              onClick={() => navigate({ to: '/auth/register' })}
              sx={{ ml: 1 }}
            >
              立即注册
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