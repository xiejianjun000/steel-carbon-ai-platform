from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum
import json
import logging

logger = logging.getLogger(__name__)


class AgentRole(str, Enum):
    """Agent角色枚举"""
    CARBON_ACCOUNTING = "carbon_accounting"
    CARBON_MONITOR = "carbon_monitor"
    CARBON_TRADE = "carbon_trade"
    CBAM_COMPLIANCE = "cbam_compliance"
    VERIFICATION = "verification"
    KNOWLEDGE_BASE = "knowledge_base"


@dataclass
class AgentContext:
    """Agent执行上下文"""
    task_id: str
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    params: Dict[str, Any] = field(default_factory=dict)
    history: List[Dict[str, str]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ToolResult:
    """工具调用结果"""
    success: bool
    data: Any = None
    error: Optional[str] = None
    tool_name: str = ""


class BaseAgent(ABC):
    """Agent基类 - 所有智能体的抽象基类"""

    def __init__(self, name: str, role: AgentRole, description: str):
        self.name = name
        self.role = role
        self.description = description
        self.tools: Dict[str, callable] = {}
        self.logger = logging.getLogger(f"agent.{role.value}")

    def register_tool(self, name: str, func: callable):
        """注册工具"""
        self.tools[name] = func
        self.logger.info(f"工具已注册: {name}")

    def call_tool(self, name: str, **kwargs) -> ToolResult:
        """调用工具"""
        if name not in self.tools:
            return ToolResult(success=False, error=f"未知的工具: {name}", tool_name=name)

        try:
            result = self.tools[name](**kwargs)
            return ToolResult(success=True, data=result, tool_name=name)
        except Exception as e:
            self.logger.error(f"工具调用失败 [{name}]: {e}")
            return ToolResult(success=False, error=str(e), tool_name=name)

    @abstractmethod
    async def execute(self, context: AgentContext) -> Dict[str, Any]:
        """
        执行Agent任务

        Args:
            context: 执行上下文

        Returns:
            执行结果字典
        """
        raise NotImplementedError

    def get_system_prompt(self) -> str:
        """获取系统提示词"""
        return f"你是一个专业的AI助手，专注于{self.description}。"


class ToolRegistry:
    """工具注册中心 - 管理所有可用工具"""

    def __init__(self):
        self._tools: Dict[str, Dict[str, Any]] = {}

    def register(self, name: str, description: str, func: callable, parameters: Dict = None):
        """注册工具"""
        self._tools[name] = {
            "name": name,
            "description": description,
            "function": func,
            "parameters": parameters or {},
        }

    def get(self, name: str) -> Optional[callable]:
        """获取工具函数"""
        tool = self._tools.get(name)
        return tool["function"] if tool else None

    def list_tools(self) -> List[Dict[str, Any]]:
        """列出所有工具"""
        return [
            {"name": t["name"], "description": t["description"], "parameters": t["parameters"]}
            for t in self._tools.values()
        ]

    async def call(self, name: str, **kwargs) -> Any:
        """调用工具"""
        func = self.get(name)
        if not func:
            raise ValueError(f"未知的工具: {name}")
        return await func(**kwargs) if asyncio.iscoroutinefunction(func) else func(**kwargs)


import asyncio
