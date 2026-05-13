"""
Agent编排引擎 - 任务分解、调度、结果聚合
"""
import logging
from typing import Any, Dict, List, Optional
from app.agents.base_agent import BaseAgent, AgentContext, AgentRole
from app.agents.carbon_accounting import CarbonAccountingAgent
from app.agents.carbon_monitor import CarbonMonitorAgent
from app.agents.knowledge_base import KnowledgeBaseAgent

logger = logging.getLogger(__name__)


class Orchestrator:
    """Agent编排引擎 - 负责任务分解、Agent调度、结果聚合"""

    def __init__(self):
        self._agents: Dict[AgentRole, BaseAgent] = {}
        self._register_default_agents()

    def _register_default_agents(self):
        """注册默认Agent"""
        self.register_agent(CarbonAccountingAgent())
        self.register_agent(CarbonMonitorAgent())
        self.register_agent(KnowledgeBaseAgent())
        logger.info(f"已注册 {len(self._agents)} 个Agent: {[a.name for a in self._agents.values()]}")

    def register_agent(self, agent: BaseAgent):
        """注册Agent"""
        self._agents[agent.role] = agent
        logger.info(f"Agent已注册: {agent.name} ({agent.role.value})")

    def get_agent(self, role: AgentRole) -> Optional[BaseAgent]:
        """获取Agent"""
        return self._agents.get(role)

    async def dispatch(
        self,
        agent_role: AgentRole,
        params: Dict[str, Any],
        conversation_id: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        分发任务给指定Agent

        Args:
            agent_role: Agent角色
            params: 任务参数
            conversation_id: 对话ID
            user_id: 用户ID

        Returns:
            执行结果
        """
        agent = self.get_agent(agent_role)
        if not agent:
            return {"success": False, "error": f"未找到Agent: {agent_role}"}

        context = AgentContext(
            task_id=f"task_{id(agent)}_{hash(str(params)) % 10000}",
            user_id=user_id,
            conversation_id=conversation_id,
            params=params,
        )

        logger.info(f"任务分发: {agent.name} <- {params}")
        result = await agent.execute(context)
        logger.info(f"任务完成: {agent.name} -> success={result.get('success')}")

        return result

    async def run_multi_agent_workflow(
        self,
        workflow: List[Dict[str, Any]],
        initial_params: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        运行多Agent协作工作流

        Args:
            workflow: 工作流步骤列表 [{"role": "carbon_accounting", "params": {...}}, ...]
            initial_params: 初始参数

        Returns:
            工作流执行结果
        """
        results = {}
        shared_params = dict(initial_params or {})

        for i, step in enumerate(workflow):
            role = step.get("role")
            step_params = {**shared_params, **step.get("params", {})}

            if not role:
                logger.warning(f"工作流步骤 {i} 缺少 role")
                continue

            try:
                result = await self.dispatch(
                    AgentRole(role),
                    step_params,
                    step.get("conversation_id"),
                    step.get("user_id"),
                )
                results[role] = result

                # 将结果传递给下一步
                if result.get("success") and result.get("data"):
                    shared_params.update(result["data"])

            except Exception as e:
                logger.error(f"工作流步骤 {i} ({role}) 执行失败: {e}")
                results[role] = {"success": False, "error": str(e)}

        # 检查是否所有步骤都成功
        all_success = all(r.get("success") for r in results.values())
        return {
            "success": all_success,
            "workflow_results": results,
            "shared_params": shared_params,
        }

    def list_agents(self) -> List[Dict[str, str]]:
        """列出所有可用Agent"""
        return [
            {"role": agent.role.value, "name": agent.name, "description": agent.description}
            for agent in self._agents.values()
        ]


# 全局编排器实例
orchestrator = Orchestrator()
