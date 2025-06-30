import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      title: '用户管理',
      description: '完整的用户注册、登录、权限管理系统',
      icon: '👥',
    },
    {
      title: 'REST API',
      description: '基于Fastify的高性能REST API服务',
      icon: '🚀',
    },
    {
      title: 'MongoDB',
      description: '使用事务支持的MongoDB数据库',
      icon: '🍃',
    },
    {
      title: '动态路由',
      description: '基于文件系统的自动路由生成',
      icon: '🛣️',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          全栈开发脚手架
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          基于 React + Fastify + MongoDB 的现代化全栈解决方案
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            sx={{ mr: 2 }}
            onClick={() => navigate({ to: '/admin' })}
          >
            进入管理后台
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate({ to: '/auth/login' })}
          >
            用户登录
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        核心功能
      </Typography>
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h2" component="div" sx={{ mb: 2 }}>
                  {feature.icon}
                </Typography>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Info */}
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          技术栈
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Frontend: React 19 + TanStack Router + MUI + Tailwind CSS<br />
          Backend: Fastify + Prisma + MongoDB<br />
          Common: TypeScript + Zod
        </Typography>
      </Box>
    </Container>
  );
} 