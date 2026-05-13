import { Router, Request, Response } from 'express';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: '/tmp/uploads/', limits: { fileSize: 50 * 1024 * 1024 } });

// 模拟知识库
const documents = [
  { id: 1, title: 'GB/T 32150-2025《工业企业温室气体排放核算和报告通则》', category: 'STANDARD', docType: 'PDF', publishedAt: '2025-12-31' },
  { id: 2, title: 'GB/T 32151.5-2026《温室气体排放核算与报告要求 第5部分：钢铁生产企业》', category: 'STANDARD', docType: 'PDF', publishedAt: '2026-03-31' },
  { id: 3, title: '全国碳排放权交易管理条例', category: 'POLICY', docType: 'DOCX', publishedAt: '2024-05-01' },
  { id: 4, title: 'CBAM碳边境调节机制过渡期实施细则', category: 'POLICY', docType: 'PDF', publishedAt: '2023-10-01' },
  { id: 5, title: '钢铁行业碳达峰实施方案', category: 'GUIDE', docType: 'PDF', publishedAt: '2022-02-01' },
  { id: 6, title: '冷钢碳排放管理办法（内部）', category: 'ENTERPRISE', docType: 'DOCX', publishedAt: '2024-01-15' },
  { id: 7, title: '2024年度全国碳市场发展报告', category: 'GUIDE', docType: 'PDF', publishedAt: '2025-03-01' },
  { id: 8, title: '企业温室气体排放核算方法与报告指南', category: 'STANDARD', docType: 'PDF', publishedAt: '2023-12-01' },
];

// 预设问答知识库
const qaKnowledge: Record<string, { answer: string; sources: any[] }> = {
  '核算标准': {
    answer: '钢铁生产企业碳排放核算应采用GB/T 32151.5-2026《温室气体排放核算与报告要求 第5部分：钢铁生产企业》，同时参考GB/T 32150-2025《工业企业温室气体排放核算和报告通则》。\n\n核算范围包括：\n1. 化石燃料燃烧排放\n2. 过程排放（石灰石/白云石分解）\n3. 净购入电力排放',
    sources: [{ documentId: 2, title: 'GB/T 32151.5-2026', relevance: 0.95 }, { documentId: 1, title: 'GB/T 32150-2025', relevance: 0.88 }],
  },
  '排放源': {
    answer: '钢铁企业的主要碳排放源包括：\n\n**燃料燃烧排放**：焦炭、煤炭、天然气、煤气等化石燃料燃烧产生的CO₂\n\n**过程排放**：\n- 石灰石分解（CaCO₃ → CaO + CO₂）\n- 白云石分解（CaCO₃·MgCO₃ → CaO·MgO + 2CO₂）\n- 炼钢降碳过程\n\n**净购入电力排放**：外购电力对应的电网排放',
    sources: [{ documentId: 2, title: 'GB/T 32151.5-2026', relevance: 0.92 }],
  },
  '碳配额': {
    answer: '全国碳市场配额分配采用基准线法，主要流程如下：\n\n1. 政府核定各行业碳排放基准值\n2. 根据企业产能和基准值计算免费配额\n3. 通过拍卖获得有偿配额\n4. CCER可用于抵消5%以内的配额\n\n当前碳价约70-100元/吨CO₂。',
    sources: [{ documentId: 3, title: '全国碳排放权交易管理条例', relevance: 0.90 }],
  },
};

/**
 * POST /api/v1/knowledge/ask - 智能问答
 */
router.post('/ask', async (req: Request, res: Response) => {
  const { question, conversationId } = req.body;

  if (!question) {
    return res.status(400).json({ code: 400, message: '问题不能为空', data: null, timestamp: new Date().toISOString(), traceId: '' });
  }

  // 简单关键词匹配（生产环境应调用AI Agent服务）
  let answer = '抱歉，我暂时无法回答这个问题。您可以尝试询问关于碳排放核算标准、排放源、碳配额等问题。';
  let sources: any[] = [];

  for (const [keyword, knowledge] of Object.entries(qaKnowledge)) {
    if (question.includes(keyword)) {
      answer = knowledge.answer;
      sources = knowledge.sources;
      break;
    }
  }

  res.json({
    code: 200, message: 'ok',
    data: {
      answer,
      sources,
      conversationId: conversationId || `conv_${Date.now()}`,
    },
    timestamp: new Date().toISOString(), traceId: '',
  });
});

/**
 * GET /api/v1/knowledge/documents - 获取文档列表
 */
router.get('/documents', (req: Request, res: Response) => {
  const { category, page = '1', pageSize = '10' } = req.query as any;

  let filtered = documents;
  if (category) filtered = filtered.filter((d) => d.category === category);

  const p = parseInt(page);
  const ps = parseInt(pageSize);

  res.json({
    code: 200, message: 'ok',
    data: { total: filtered.length, page: p, pageSize: ps, list: filtered.slice((p - 1) * ps, p * ps) },
    timestamp: new Date().toISOString(), traceId: '',
  });
});

/**
 * POST /api/v1/knowledge/documents/upload - 上传文档
 */
router.post('/documents/upload', upload.single('file'), (req: Request, res: Response) => {
  res.json({
    code: 200, message: '文档上传成功',
    data: { documentId: documents.length + 1, fileName: req.file?.originalname },
    timestamp: new Date().toISOString(), traceId: '',
  });
});

export default router;
