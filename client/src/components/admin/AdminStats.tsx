import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
// import type { StatsResponse, ChartResponse } from 'common';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function AdminStats() {
  // 获取统计数据
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await adminAPI.getStats();
      return response.data;
    },
  });

  // 获取图表数据
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['admin', 'chart', 'users', '7d'],
    queryFn: async () => {
      const response = await adminAPI.getChartData('users', '7d');
      return response.data;
    },
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '用户数据趋势',
      },
    },
  };

  const systemStats = statsData ? [
    { 
      label: '内存使用率', 
      value: statsData.system.memoryUsage.percentage, 
      color: statsData.system.memoryUsage.percentage > 80 ? 'error' : 
             statsData.system.memoryUsage.percentage > 60 ? 'warning' : 'success'
    },
    { 
      label: '运行时间', 
      value: Math.min(Math.round(statsData.system.uptime / 3600), 100), 
      color: 'primary' 
    },
  ] : [];

  if (statsLoading || chartLoading) {
    return <Typography>加载中...</Typography>;
  }

  return (
    <Box>
      {/* User Stats Cards */}
      {statsData && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                总用户数
              </Typography>
              <Typography variant="h4">
                {statsData.users.total}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                活跃用户
              </Typography>
              <Typography variant="h4">
                {statsData.users.active}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                管理员
              </Typography>
              <Typography variant="h4">
                {statsData.users.admins}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                本月新增
              </Typography>
              <Typography variant="h4">
                {statsData.users.newThisMonth}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            数据趋势分析
          </Typography>
          {chartData && <Line data={chartData} options={chartOptions} />}
        </CardContent>
      </Card>

      {/* System Stats */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            系统状态
          </Typography>
          {systemStats.map((stat, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{stat.label}</Typography>
                <Typography variant="body2">{stat.value}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stat.value}
                color={stat.color as any}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
} 