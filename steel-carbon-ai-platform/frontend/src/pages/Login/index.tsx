import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
} from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import { login } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

/**
 * 登录页面
 */
export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res: any = await login(form.username, form.password);
      if (res.code === 200) {
        setAuth(res.data.token, res.data.user);
        navigate('/dashboard');
      } else {
        setError(res.message || '登录失败');
      }
    } catch (err: any) {
      setError(err?.message || '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ width: 400, maxWidth: '90vw' }}>
      <CardContent sx={{ p: 4 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <CloudIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
            冷钢碳排放AI平台
          </Typography>
          <Typography variant="body2" color="text.secondary">
            企业碳排放智慧管理
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="用户名"
            margin="normal"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="密码"
            type="password"
            margin="normal"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 2, mb: 1 }}
          >
            {loading ? '登录中...' : '登 录'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
