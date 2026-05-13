"""
Chat API - 对话接口
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.core.orchestrator import orchestrator
from app.agents.base_agent import AgentRole

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    agent_role: Optional[str] = None


# 预设问题路由
QUESTION_ROUTES = {
    "核算": "carbon_accounting",
    "排放": "carbon_accounting",
    "计算": "carbon_accounting",
    "监测": "carbon_monitor",
    "预警": "carbon_monitor",
    "异常": "carbon_monitor",
    "知识": "knowledge_base",
    "政策": "knowledge_base",
    "标准": "knowledge_base",
    "法规": "knowledge_base",
    "CBAM": "knowledge_base",
    "配额": "knowledge_base",
    "碳交易": "knowledge_base",
}


@router.post("/completion")
async def chat_completion(request: ChatRequest):
    """对话补全 - 根据用户消息自动选择Agent并返回回答"""
    message = request.message

    # 自动识别Agent
    agent_role = request.agent_role
    if not agent_role:
        for keyword, role in QUESTION_ROUTES.items():
            if keyword in message:
                agent_role = role
                break
        if not agent_role:
            agent_role = "knowledge_base"  # 默认使用知识库Agent

    result = await orchestrator.dispatch(
        role=AgentRole(agent_role),
        params={"question": message},
        conversation_id=request.conversation_id,
    )

    return {
        "code": 200,
        "data": {
            "answer": result.get("data", {}).get("answer", "") if result.get("success") else f"处理失败: {result.get('error')}",
            "agent_used": agent_role,
            "sources": result.get("data", {}).get("sources", []),
            "conversation_id": request.conversation_id or result.get("data", {}).get("conversation_id"),
        },
    }
