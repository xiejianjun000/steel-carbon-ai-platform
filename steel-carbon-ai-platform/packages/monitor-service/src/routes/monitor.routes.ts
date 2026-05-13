import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/v1/monitor/dashboard - 获取监控仪表盘数据
 */
router.get('/dashboard', (_req: Request, res: Response) => {
  res.json({
    code: 200, message: 'ok',
    data: {
      yearlyTotal: 1234567.89,
      yearlyTarget: 3711981.00,
      monthlyEmission: 309331.75,
      lastMonthEmission: 315000.00,
      intensity: 1.97,
      emissionStructure: { fuel: 274002.33, process: 19174.50, electricity: 16154.92 },
      processRanking: [
        { processId: 2, name: '炼铁', emission: 165000 },
        { processId: 1, name: '烧结', emission: 82500 },
        { processId: 3, name: '炼钢', emission: 42000 },
        { processId: 5, name: '焦化', emission: 15832 },
        { processId: 4, name: '轧钢', emission: 4000 },
      ],
      recentAlerts: [
        { id: 1, level: 'YELLOW', title: '高炉煤气排放偏高', status: 'PENDING' },
        { id: 2, level: 'RED', title: '烧结工序月排放超标', status: 'PENDING' },
        { id: 3, level: 'BLUE', title: '轧钢工序电力消耗增长', status: 'PENDING' },
      ],
    },
    timestamp: new Date().toISOString(), traceId: '',
  });
});

/**
 * GET /api/v1/monitor/realtime - 获取实时排放数据
 */
router.get('/realtime', (req: Request, res: Response) => {
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    emission: (10000 + Math.random() * 5000).toFixed(1),
  }));

  res.json({
    code: 200, message: 'ok',
    data: { date: new Date().toISOString().split('T')[0], hourlyData },
    timestamp: new Date().toISOString(), traceId: '',
  });
});

/**
 * GET /api/v1/monitor/alerts - 获取预警列表
 */
router.get('/alerts', (req: Request, res: Response) => {
  const { level, status, page = '1', pageSize = '20' } = req.query as any;

  const allAlerts = [
    { id: 1, alertType: 'THRESHOLD', level: 'YELLOW', title: '4#高炉CO₂排放超过日均值15%', description: '2025年5月12日10:30检测到炼铁工序4#高炉CO₂小时排放量超过日均值15%', status: 'PENDING', triggeredAt: '2025-05-12T10:30:00Z' },
    { id: 2, alertType: 'TREND', level: 'RED', title: '烧结工序月排放趋势超标', description: '烧结工序近7天排放量呈上升趋势，预计本月排放将超过配额上限的90%', status: 'PENDING', triggeredAt: '2025-05-12T09:15:00Z' },
    { id: 3, alertType: 'YOY', level: 'BLUE', title: '轧钢工序同比排放增长12%', description: '轧钢工序本月累计排放较去年同期增长12%', status: 'PROCESSING', triggeredAt: '2025-05-11T14:20:00Z' },
    { id: 4, alertType: 'AI_PREDICT', level: 'YELLOW', title: 'AI预测下月排放将增加5%', description: '基于历史数据和产能计划，AI预测下月碳排放将增加约5%', status: 'RESOLVED', triggeredAt: '2025-05-10T08:00:00Z' },
    { id: 5, alertType: 'THRESHOLD', level: 'YELLOW', title: '烧结工序日排放量偏高', description: '烧结工序当日累计排放量达到日均值的110%', status: 'PENDING', triggeredAt: '2025-05-09T16:45:00Z' },
  ];

  let filtered = allAlerts;
  if (level) filtered = filtered.filter((a) => a.level === level);
  if (status) filtered = filtered.filter((a) => a.status === status);

  const p = parseInt(page);
  const ps = parseInt(pageSize);

  res.json({
    code: 200, message: 'ok',
    data: { total: filtered.length, page: p, pageSize: ps, list: filtered.slice((p - 1) * ps, p * ps) },
    timestamp: new Date().toISOString(), traceId: '',
  });
});

/**
 * PUT /api/v1/monitor/alerts/:id/resolve - 处理预警
 */
router.put('/alerts/:id/resolve', (req: Request, res: Response) => {
  const { id } = req.params;
  const { resolution } = req.body;

  res.json({
    code: 200, message: '预警已处理',
    data: { alertId: parseInt(id), resolution, resolvedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(), traceId: '',
  });
});

export default router;
