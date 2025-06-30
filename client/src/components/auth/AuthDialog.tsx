import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Tabs,
  Tab,
  IconButton,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export function AuthDialog({ open, onClose, defaultTab = 'login' }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState(defaultTab === 'login' ? 0 : 1);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  React.useEffect(() => {
    if (open) {
      setActiveTab(defaultTab === 'login' ? 0 : 1);
    }
  }, [open, defaultTab]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            zIndex: 1,
          }}
        >
          <Close />
        </IconButton>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="登录" />
            <Tab label="注册" />
          </Tabs>
        </Box>

        <DialogContent sx={{ px: 4, pb: 4 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h5" component="h2" sx={{ textAlign: 'center', mb: 2 }}>
                欢迎回来
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                请输入您的账户信息进行登录
              </Typography>
              <LoginForm />
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h5" component="h2" sx={{ textAlign: 'center', mb: 2 }}>
                创建账户
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                填写信息创建新账户
              </Typography>
              <RegisterForm />
            </Box>
          )}
        </DialogContent>
      </Box>
    </Dialog>
  );
} 