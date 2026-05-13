import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// 请求日志
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const traceId = Math.random().toString(36).substring(2, 10);
  (req as any).traceId = traceId;
  res.on('finish', () => {
    console.log(`[Gateway] ${traceId} ${req.method} ${req.path} - ${res.statusCode} [${Date.now() - start}ms]`);
  });
  next();
});

// 服务路由映射
const serviceRoutes: Record<string, { target: string; rewrite?: (path: string) => string }> = {
  '/api/v1/auth': { target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001' },
  '/api/v1/carbon': { target: process.env.CARBON_SERVICE_URL || 'http://localhost:3002' },
  '/api/v1/monitor': { target: process.env.MONITOR_SERVICE_URL || 'http://localhost:3003' },
  '/api/v1/trade': { target: process.env.TRADE_SERVICE_URL || 'http://localhost:3004' },
  '/api/v1/cbam': { target: process.env.CBAM_SERVICE_URL || 'http://localhost:3005' },
  '/api/v1/verify': { target: process.env.VERIFY_SERVICE_URL || 'http://localhost:3006' },
  '/api/v1/knowledge': { target: process.env.KNOWLEDGE_SERVICE_URL || 'http://localhost:3007' },
  '/api/v1/report': { target: process.env.REPORT_SERVICE_URL || 'http://localhost:3008' },
  '/api/v1/system': { target: process.env.SYSTEM_SERVICE_URL || 'http://localhost:3009' },
};

// 注册代理路由
for (const [path, config] of Object.entries(serviceRoutes)) {
  app.use(path, createProxyMiddleware({
    target: config.target,
    changeOrigin: true,
    pathRewrite: config.rewrite,
    onError: (err, _req, res) => {
      console.error(`[Gateway Proxy Error] ${path} -> ${config.target}: ${err.message}`);
      if ('writeHead' in res && typeof res.writeHead === 'function') {
        res.writeHead(503);
      }
      if ('end' in res && typeof res.end === 'function') {
        res.end(JSON.stringify({
          code: 503,
          message: `服务暂时不可用: ${path}`,
          data: null,
          timestamp: new Date().toISOString(),
          traceId: '',
        }));
      }
    },
  }));
}

// 网关健康检查
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[API Gateway] 运行在 http://localhost:${PORT}`);
  console.log(`[API Gateway] 已注册路由: ${Object.keys(serviceRoutes).join(', ')}`);
});
