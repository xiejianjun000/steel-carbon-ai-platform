from fastapi import FastAPI
from app.api.agent import router as agent_router
from app.api.chat import router as chat_router

app = FastAPI(title="冷钢碳排放AI智能体服务", version="1.0.0")

app.include_router(agent_router, prefix="/api/v1/agent", tags=["Agent"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chat"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-agent", "version": "1.0.0"}
