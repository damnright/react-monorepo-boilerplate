import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Box } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { AdminStats } from '@/components/admin/AdminStats';
import { RecentActivity } from '@/components/admin/RecentActivity';

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    { title: '总用户数', value: '1,234', icon: '👥', color: 'primary.main' },
    { title: '今日访问', value: '567', icon: '📊', color: 'secondary.main' },
    { title: '活跃会话', value: '89', icon: '🔥', color: 'warning.main' },
    { title: '系统状态', value: '正常', icon: '✅', color: 'success.main' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          管理面板
        </Typography>
        <Typography variant="body1" color="text.secondary">
          欢迎回来，{user?.name || '管理员'}！这里是您的管理控制台。
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h4" sx={{ mr: 2 }}>
                    {stat.icon}
                  </Typography>
                  <Box>
                    <Typography variant="h5" component="div" sx={{ color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Admin Components */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <AdminStats />
        </Grid>
        <Grid item xs={12} md={4}>
          <RecentActivity />
        </Grid>
      </Grid>
    </Container>
  );
} 