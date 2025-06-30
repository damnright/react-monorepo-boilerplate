import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Settings,
  Logout,
  AccountCircle,
  Home,
  Login,
} from '@mui/icons-material';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/auth/AuthDialog';

const drawerWidth = 240;

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState<'login' | 'register'>('login');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate({ to: '/' });
  };

  const handleLogin = (tab: 'login' | 'register' = 'login') => {
    setAuthDialogTab(tab);
    setAuthDialogOpen(true);
  };

  // 导航菜单项
  const navigationItems = [
    { text: '首页', icon: <Home />, path: '/' },
    ...(isAuthenticated
      ? [
          { text: '管理面板', icon: <Dashboard />, path: '/admin', adminOnly: true },
          { text: '用户管理', icon: <People />, path: '/admin/users', adminOnly: true },
          { text: '设置', icon: <Settings />, path: '/settings' },
        ]
      : []),
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          管理系统
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => {
          // 如果是管理员专用项目，检查权限
          if (item.adminOnly && user?.role !== 'admin') {
            return null;
          }

          return (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate({ to: item.path })}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: isAdminRoute ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: isAdminRoute ? `${drawerWidth}px` : 0 },
        }}
      >
        <Toolbar>
          {isAdminRoute && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {isAdminRoute ? '管理后台' : '全栈脚手架'}
          </Typography>

          {isAuthenticated ? (
            <div>
              <IconButton
                size="large"
                edge="end"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <AccountCircle />
                  )}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem onClick={handleProfileMenuClose}>
                  <AccountCircle sx={{ mr: 1 }} />
                  个人资料
                </MenuItem>
                <MenuItem onClick={handleProfileMenuClose}>
                  <Settings sx={{ mr: 1 }} />
                  设置
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  退出登录
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <Box>
              <Button color="inherit" onClick={() => handleLogin('login')}>
                登录
              </Button>
              <Button color="inherit" onClick={() => handleLogin('register')}>
                注册
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer - 只在管理页面显示 */}
      {isAdminRoute && (
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: isAdminRoute ? `calc(100% - ${drawerWidth}px)` : '100%' },
        }}
      >
        <Toolbar />
        {children}
      </Box>

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        defaultTab={authDialogTab}
      />
    </Box>
  );
} 