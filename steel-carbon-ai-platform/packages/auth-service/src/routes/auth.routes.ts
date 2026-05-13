import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_at_least_32_chars';
const JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN || '86400', 10);

// 模拟用户数据库（生产环境应连接MySQL）
const users: any[] = [
  { id: 1, username: 'admin', passwordHash: '$2b$12$LJ3m4ys3Lk0OV6yR1dRBdeYBEP6BKCu6GTkQqC1b0HnK1nV6dHY9e', realName: '管理员', roles: ['ADMIN'] },
  { id: 2, username: 'manager', passwordHash: '$2b$12$LJ3m4ys3Lk0OV6yR1dRBdeYBEP6BKCu6GTkQqC1b0HnK1nV6dHY9e', realName: '张管理', roles: ['CARBON_MANAGER'] },
  { id: 3, username: 'operator', passwordHash: '$2b$12$LJ3m4ys3Lk0OV6yR1dRBdeYBEP6BKCu6GTkQqC1b0HnK1nV6dHY9e', realName: '李操作', roles: ['ENERGY_OPERATOR'] },
];

/**
 * POST /api/v1/auth/login - 用户登录
 */
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      code: 400, message: '用户名和密码不能为空', data: null,
      timestamp: new Date().toISOString(), traceId: '',
    });
  }

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({
      code: 401, message: '用户名或密码错误', data: null,
      timestamp: new Date().toISOString(), traceId: '',
    });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({
      code: 401, message: '用户名或密码错误', data: null,
      timestamp: new Date().toISOString(), traceId: '',
    });
  }

  // 生成JWT Token
  const token = jwt.sign(
    { sub: user.id, username: user.username, roles: user.roles },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    code: 200,
    message: '登录成功',
    data: {
      token,
      expiresIn: JWT_EXPIRES_IN,
      user: { id: user.id, username: user.username, realName: user.realName, roles: user.roles },
    },
    timestamp: new Date().toISOString(),
    traceId: '',
  });
});

/**
 * POST /api/v1/auth/logout - 用户登出
 */
router.post('/logout', (req: Request, res: Response) => {
  res.json({
    code: 200, message: 'logout success',
    data: null, timestamp: new Date().toISOString(), traceId: '',
  });
});

/**
 * GET /api/v1/auth/me - 获取当前用户信息
 */
router.get('/me', (req: Request, res: Response) => {
  // 从headers中解析token获取用户信息
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401, message: '未授权', data: null,
      timestamp: new Date().toISOString(), traceId: '',
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find((u) => u.id === decoded.sub);
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在', data: null, timestamp: new Date().toISOString(), traceId: '' });
    }
    res.json({
      code: 200, message: 'ok',
      data: { id: user.id, username: user.username, realName: user.realName, roles: user.roles },
      timestamp: new Date().toISOString(), traceId: '',
    });
  } catch {
    res.status(401).json({ code: 401, message: 'Token已过期', data: null, timestamp: new Date().toISOString(), traceId: '' });
  }
});

export default router;
