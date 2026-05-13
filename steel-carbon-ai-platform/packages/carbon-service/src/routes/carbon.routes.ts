import { Router, Request, Response } from 'express';
import multer from 'multer';
import {
  performCalculation,
  getAllFactors,
  getFactorsByCategory,
  ActivityItem,
} from '../services/calculation.service.js';

const router = Router();
const upload = multer({ dest: '/tmp/uploads/', limits: { fileSize: 50 * 1024 * 1024 } });

// 模拟活动数据存储
const activityDataStore: any[] = [
  { id: 1, paramCode: 'AL-1', paramName: '焦炭消耗量', value: 775092.54, unit: '吨', periodMonth: '2025-01', processId: 2, dataSource: 'EXCEL', status: 'SUBMITTED' },
  { id: 2, paramCode: 'AL-2', paramName: '无烟煤消耗量', value: 45230.00, unit: '吨', periodMonth: '2025-01', processId: 1, dataSource: 'EXCEL', status: 'SUBMITTED' },
  { id: 3, paramCode: 'AL-3', paramName: '天然气消耗量', value: 1256.80, unit: '万m³', periodMonth: '2025-01', processId: 4, dataSource: 'MANUAL', status: 'DRAFT' },
  { id: 4, paramCode: 'AE-1', paramName: '净购入电量', value: 79655.58, unit: '万kWh', periodMonth: '2025-01', processId: 0, dataSource: 'EMS', status: 'SUBMITTED' },
  { id: 5, paramCode: 'AP-1', paramName: '石灰石消耗量', value: 35200.00, unit: '吨', periodMonth: '2025-01', processId: 3, dataSource: 'EXCEL', status: 'SUBMITTED' },
];

/**
 * GET /api/v1/carbon/activity-data - 获取活动数据列表
 */
router.get('/activity-data', (req: Request, res: Response) => {
  const { periodMonth, processId, page = '1', pageSize = '20' } = req.query as any;
  let filtered = activityDataStore;
  if (periodMonth) filtered = filtered.filter((d) => d.periodMonth === periodMonth);
  if (processId) filtered = filtered.filter((d) => d.processId === parseInt(processId));

  const p = parseInt(page);
  const ps = parseInt(pageSize);
  const list = filtered.slice((p - 1) * ps, p * ps);

  res.json({
    code: 200, message: 'ok',
    data: { total: filtered.length, page: p, pageSize: ps, list },
    timestamp: new Date().toISOString(), traceId: '',
  });
});

/**
 * POST /api/v1/carbon/activity-data/import - 导入活动数据
 */
router.post('/activity-data/import', upload.single('file'), (req: Request, res: Response) => {
  // 实际应解析Excel文件，此处返回模拟结果
  res.json({
    code: 200, message: '导入完成',
    data: { totalRows: 150, successRows: 148, failedRows: 2, errors: [{ row: 23, message: '数值超出合理范围' }] },
    timestamp: new Date().toISOString(), traceId: '',
  });
});

/**
 * POST /api/v1/carbon/calculate - 执行碳排放计算
 */
router.post('/calculate', (req: Request, res: Response) => {
  const { periodMonth, processIds } = req.body;

  if (!periodMonth) {
    return res.status(400).json({ code: 400, message: '请指定核算月份', data: null, timestamp: new Date().toISOString(), traceId: '' });
  }

  // 构建活动数据项（实际应从数据库查询）
  const activityItems: ActivityItem[] = [
    // 烧结工序
    { fuelCode: 'FUEL_BITUMINOUS', processId: 1, consumption: 12.5, emissionType: 'FUEL' },
    { fuelCode: 'FUEL_NATGAS', processId: 1, consumption: 50, emissionType: 'FUEL' },
    // 炼铁工序（核心）
    { fuelCode: 'FUEL_COKE', processId: 2, consumption: 77.509254, emissionType: 'FUEL' },
    { fuelCode: 'FUEL_BITUMINOUS', processId: 2, consumption: 25.3, emissionType: 'FUEL' },
    { fuelCode: 'FUEL_COKING_GAS', processId: 2, consumption: 3200, emissionType: 'FUEL' },
    { fuelCode: 'FUEL_BLAST_GAS', processId: 2, consumption: -8500, emissionType: 'FUEL' },  // 回收抵扣（负值）
    // 炼钢工序
    { fuelCode: 'PROC_LIMESTONE', processId: 3, consumption: 35200, emissionType: 'PROCESS' },
    { fuelCode: 'PROC_DOLOMITE', processId: 3, consumption: 5800, emissionType: 'PROCESS' },
    { fuelCode: 'FUEL_COKING_GAS', processId: 3, consumption: 2800, emissionType: 'FUEL' },
    // 轧钢工序
    { fuelCode: 'FUEL_NATGAS', processId: 4, consumption: 800, emissionType: 'FUEL' },
    // 焦化工序
    { fuelCode: 'FUEL_BITUMINOUS', processId: 5, consumption: 45.2, emissionType: 'FUEL' },
    // 电力
    { fuelCode: 'ELEC_CENTRAL', processId: 0, consumption: 79655.58, emissionType: 'ELECTRICITY' },
  ];

  const result = performCalculation(periodMonth, activityItems);

  res.json({
    code: 200,
    message: '核算完成',
    data: result,
    timestamp: new Date().toISOString(),
    traceId: '',
  });
});

/**
 * GET /api/v1/carbon/emission-result/summary - 排放结果汇总
 */
router.get('/emission-result/summary', (req: Request, res: Response) => {
  const { periodStart, periodEnd } = req.query;

  // 模拟月度汇总数据
  const groups = [];
  const start = new Date(periodStart as string);
  const end = new Date(periodEnd as string);
  const current = new Date(start);

  while (current <= end) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    groups.push({
      key,
      fuel: 270000 + Math.random() * 10000,
      process: 19000 + Math.random() * 500,
      electricity: 16000 + Math.random() * 500,
      total: 305000 + Math.random() * 10000,
    });
    current.setMonth(current.getMonth() + 1);
  }

  res.json({
    code: 200, message: 'ok',
    data: {
      totalEmission: groups.reduce((s: number, g: any) => s + g.total, 0),
      unit: 'tCO₂',
      groups,
      intensity: { perTonSteel: 1.97, unit: 'tCO₂/t钢' },
    },
    timestamp: new Date().toISOString(), traceId: '',
  });
});

/**
 * GET /api/v1/carbon/emission-factors - 获取排放因子列表
 */
router.get('/emission-factors', (req: Request, res: Response) => {
  const { category } = req.query;
  const factors = category ? getFactorsByCategory(category as string) : getAllFactors();
  res.json({
    code: 200, message: 'ok',
    data: factors,
    timestamp: new Date().toISOString(), traceId: '',
  });
});

export default router;
