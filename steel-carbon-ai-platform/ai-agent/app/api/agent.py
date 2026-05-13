"""
Agent API - 提供Agent调用接口
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from app.core.orchestrator import orchestrator
from app.agents.base_agent import AgentRole

router = APIRouter()


class AgentRequest(BaseModel):
    agent_role: str
    params: Dict[str, Any] = {}
    conversation_id: Optional[str] = None
    user_id: Optional[str] = None


class WorkflowRequest(BaseModel):
    workflow: List[Dict[str, Any]]
    initial_params: Dict[str, Any] = {}


@router.get("/list")
async def list_agents():
    """列出所有可用Agent"""
    return {"code": 200, "data": orchestrator.list_agents()}


@router.post("/execute")
async def execute_agent(request: AgentRequest):
    """调用指定Agent执行任务"""
    try:
        role = AgentRole(request.agent_role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"未知的Agent角色: {request.agent_role}")

    result = await orchestrator.dispatch(
        role=role,
        params=request.params,
        conversation_id=request.conversation_id,
        user_id=request.user_id,
    )
    return {"code": 200, "data": result}


@router.post("/workflow")
async def run_workflow(request: WorkflowRequest):
    """运行多Agent工作流"""
    result = await orchestrator.run_multi_agent_workflow(
        workflow=request.workflow,
        initial_params=request.initial_params,
    )
    return {"code": 200, "data": result}
