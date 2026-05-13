import { Router, Request, Response } from 'express';

const router = Router();

// 用户列表
router.get('/users', (req: Request, res: Response) => {
  res.json({
    code: 200, message: 'ok',
    data: {
      total: 3,
      list: [
        { id: 1, username: 'admin', realName: '管理员', roles: ['ADMIN'], status: 1 },
        { id: 2, username: 'manager', realName: '张管理', roles: ['CARBON_MANAGER'], status: 1 },
        { id: 3, username: 'operator', realName: '李操作', roles: ['ENERGY_OPERATOR'], status: 1 },
      ],
    },
    timestamp: new Date().toISOString(), traceId: '',
  });
});

// 审计日志
router.get('/audit-logs', (req: Request, res: Response) => {
  res.json({
    code: 200, message: 'ok',
    data: { total: 0, list: [] },
    timestamp: new Date().toISOString(), traceId: '',
  });
});

export default router;
