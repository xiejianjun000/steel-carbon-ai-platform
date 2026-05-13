# 冷钢碳排放AI智慧管理平台

企业级碳排放管理解决方案，集成AI智能体实现碳核算、碳监测、碳交易、CBAM合规等全流程管理。

## 技术架构

- **前端**: Vite 5 + React 18 + TypeScript + MUI 5 + Tailwind CSS
- **后端**: Node.js 20 + Express (微服务架构)
- **AI**: Python 3.11 + FastAPI + LangChain
- **数据层**: MySQL 8.0 + Redis 7.0 + MongoDB 7.0 + MinIO
- **部署**: Docker + Docker Compose

## 项目结构

```
steel-carbon-ai-platform/
├── frontend/              # 前端项目 (Vite + React)
├── packages/              # 后端微服务
│   ├── shared/            # 共享类型和工具
│   ├── auth-service/      # 认证服务
│   ├── carbon-service/    # 碳核算服务
│   ├── monitor-service/   # 碳监测服务
│   ├── knowledge-service/ # 知识库服务
│   ├── system-service/    # 系统管理服务
│   └── api-gateway/       # API网关
├── ai-agent/              # AI智能体 (Python)
├── nginx/                 # Nginx配置
├── init-sql/              # 数据库初始化
└── docker-compose.yml     # 容器编排
```

## 快速开始

### 环境要求

- Node.js >= 20
- Python >= 3.11
- Docker & Docker Compose

### 开发模式

#### 1. 启动基础设施

```bash
# 启动MySQL、Redis、MongoDB、MinIO
docker compose up -d mysql redis mongo minio
```

#### 2. 启动后端服务

```bash
# 安装依赖并启动各微服务
cd packages/auth-service && npm install && npm run dev
cd packages/carbon-service && npm install && npm run dev
cd packages/monitor-service && npm install && npm run dev
cd packages/knowledge-service && npm install && npm run dev
cd packages/api-gateway && npm install && npm run dev
```

#### 3. 启动AI智能体服务

```bash
cd ai-agent
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173 即可使用。

### 生产部署

```bash
# 配置环境变量
cp .env.example .env
# 编辑.env填入实际配置

# 一键启动全部服务
docker compose up -d
```

## 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 系统管理员 |
| manager | manager123 | 碳管理主管 |
| operator | oper123 | 能源统计员 |

## API文档

启动后访问 http://localhost:8080/api-docs 查看Swagger文档。
