import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import knowledgeRoutes from './routes/knowledge.routes.js';

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[Knowledge Service] ${req.method} ${req.path} - ${res.statusCode} [${Date.now() - start}ms]`);
  });
  next();
});

app.use('/api/v1/knowledge', knowledgeRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'knowledge-service', timestamp: new Date().toISOString() });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[Knowledge Error] ${err.message}`);
  res.status(500).json({ code: 500, message: err.message, data: null, timestamp: new Date().toISOString(), traceId: '' });
});

app.listen(PORT, () => {
  console.log(`[Knowledge Service] 运行在 http://localhost:${PORT}`);
});
