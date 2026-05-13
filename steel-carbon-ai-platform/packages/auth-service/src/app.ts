import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import systemRoutes from './routes/system.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} [${duration}ms]`);
  });
  next();
});

// 路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/system', systemRoutes);

// 健康检查
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() });
});

// 统一错误处理
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error] ${err.message}`, err.stack);
  res.status(500).json({
    code: 500,
    message: err.message || '服务器内部错误',
    data: null,
    timestamp: new Date().toISOString(),
    traceId: Math.random().toString(36).substring(2),
  });
});

app.listen(PORT, () => {
  console.log(`[Auth Service] 运行在 http://localhost:${PORT}`);
});
