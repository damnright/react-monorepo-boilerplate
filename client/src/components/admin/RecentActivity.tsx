import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Box,
} from '@mui/material';
import {
  Person,
  Login,
  Settings,
  DeleteForever,
  Security,
} from '@mui/icons-material';

interface Activity {
  id: string;
  type: 'login' | 'register' | 'update' | 'delete' | 'security';
  user: string;
  description: string;
  time: string;
  severity: 'low' | 'medium' | 'high';
}

export function RecentActivity() {
  // Mock data - 实际应用中从API获取
  const activities: Activity[] = [
    {
      id: '1',
      type: 'login',
      user: '张三',
      description: '用户登录系统',
      time: '2分钟前',
      severity: 'low',
    },
    {
      id: '2',
      type: 'register',
      user: '李四',
      description: '新用户注册',
      time: '5分钟前',
      severity: 'medium',
    },
    {
      id: '3',
      type: 'security',
      user: '系统',
      description: '检测到异常登录尝试',
      time: '10分钟前',
      severity: 'high',
    },
    {
      id: '4',
      type: 'update',
      user: '王五',
      description: '更新个人资料',
      time: '15分钟前',
      severity: 'low',
    },
    {
      id: '5',
      type: 'delete',
      user: '管理员',
      description: '删除用户账户',
      time: '30分钟前',
      severity: 'high',
    },
  ];

  const getActivityIcon = (type: Activity['type']) => {
    const iconMap = {
      login: <Login />,
      register: <Person />,
      update: <Settings />,
      delete: <DeleteForever />,
      security: <Security />,
    };
    return iconMap[type];
  };

  const getActivityColor = (type: Activity['type']) => {
    const colorMap = {
      login: 'primary',
      register: 'success',
      update: 'info',
      delete: 'error',
      security: 'warning',
    };
    return colorMap[type];
  };

  const getSeverityColor = (severity: Activity['severity']) => {
    const colorMap = {
      low: 'success',
      medium: 'warning',
      high: 'error',
    };
    return colorMap[severity];
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          最近活动
        </Typography>
        <List>
          {activities.map((activity) => (
            <ListItem key={activity.id} divider>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: `${getActivityColor(activity.type)}.main`,
                    width: 32,
                    height: 32,
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {activity.user}
                    </Typography>
                    <Chip
                      label={activity.severity}
                      size="small"
                      color={getSeverityColor(activity.severity) as any}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {activity.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
} 