import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

/**
 * 认证布局 - 登录等页面使用
 */
export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
      }}
    >
      <Outlet />
    </Box>
  );
}
