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
  // Mock data - 实际应用中从API获取
  const chartData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [
      {
        label: '用户注册数',
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: '活跃用户数',
        data: [45, 39, 60, 61, 36, 35],
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

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

  const systemStats = [
    { label: 'CPU 使用率', value: 45, color: 'primary' },
    { label: '内存使用率', value: 67, color: 'warning' },
    { label: '磁盘使用率', value: 23, color: 'success' },
    { label: '网络带宽', value: 89, color: 'error' },
  ];

  return (
    <Box>
      {/* Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            数据趋势分析
          </Typography>
          <Line data={chartData} options={chartOptions} />
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