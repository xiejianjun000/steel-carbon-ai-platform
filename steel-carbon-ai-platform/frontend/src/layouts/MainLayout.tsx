import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Avatar, Menu, MenuItem,
  Divider, useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalculateIcon from '@mui/icons-material/Calculate';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import GavelIcon from '@mui/icons-material/Gavel';
import { useAuthStore } from '../store/authStore';

const DRAWER_WIDTH = 240;

// 侧边栏菜单配置
const menuItems = [
  { text: '碳排放概览', icon: <DashboardIcon />, path: '/dashboard' },
  { text: '活动数据管理', icon: <CalculateIcon />, path: '/carbon/activity-data' },
  { text: '排放因子管理', icon: <BarChartIcon />, path: '/carbon/emission-factor' },
  { text: '核算结果', icon: <CalculateIcon />, path: '/carbon/emission-result' },
  { text: '碳监测大屏', icon: <MonitorHeartIcon />, path: '/monitor/screen' },
  { text: '工序监控', icon: <MonitorHeartIcon />, path: '/monitor/process' },
  { text: '异常预警', icon: <WarningAmberIcon />, path: '/monitor/alerts' },
  { text: '智能问答', icon: <QuestionAnswerIcon />, path: '/knowledge/qa' },
  { text: '政策法规', icon: <GavelIcon />, path: '/knowledge/policy' },
  { text: '知识库', icon: <MenuBookIcon />, path: '/knowledge/policy' },
];

/**
 * 主布局 - 侧边栏 + 顶栏 + 内容区
 */
export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo区域 */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <MonitorHeartIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          冷钢碳管理平台
        </Typography>
      </Box>
      <Divider />

      {/* 菜单项 */}
      <List sx={{ flex: 1, overflow: 'auto', pt: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setDrawerOpen(false);
            }}
            sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14 }} />
          </ListItemButton>
        ))}
      </List>

      {/* 底部信息 */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          冷钢碳排放AI智慧管理平台 V1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* 侧边栏 */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* 主内容区 */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* 顶栏 */}
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', color: 'text.primary' }}>
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ mr: 2, display: isMobile ? 'block' : 'none' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flex: 1 }} fontWeight="bold">
              {menuItems.find((item) => item.path === location.pathname)?.text || '碳排放管理'}
            </Typography>

            {/* 用户菜单 */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem disabled>
                <Typography variant="body2">
                  {user?.realName || user?.username || '用户'}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                退出登录
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* 页面内容 */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3, bgcolor: '#f5f5f5' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
