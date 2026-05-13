"""
碳监测Agent - 实时监控碳排放数据，检测异常并预警
"""
import random
from typing import Any, Dict, List
from app.agents.base_agent import BaseAgent, AgentRole, AgentContext


class CarbonMonitorAgent(BaseAgent):
    """碳监测Agent - 实时监控、异常检测、预警生成"""

    def __init__(self):
        super().__init__(
            name="碳监测Agent",
            role=AgentRole.CARBON_MONITOR,
            description="实时监控碳排放数据，检测异常并生成预警"
        )

    def get_system_prompt(self) -> str:
        return """你是一个专业的碳排放监测智能体。你需要分析实时碳排放数据，检测异常模式并生成预警。

异常检测规则：
1. 阈值检测：排放值超过预设阈值
2. 趋势分析：连续多个周期排放持续上升
3. 同比分析：与去年同期对比变化超过阈值
4. AI预测：基于历史趋势预测未来排放

预警级别：
- 蓝色(BLUE)：关注提醒
- 黄色(YELLOW)：需要关注
- 红色(RED)：需要立即处理"""

    async def execute(self, context: AgentContext) -> Dict[str, Any]:
        """执行碳监测分析"""
        process_id = context.params.get("process_id")
        check_type = context.params.get("check_type", "ALL")

        self.logger.info(f"执行碳监测: 工序={process_id}, 类型={check_type}")

        # 模拟监测结果
        alerts = []
        checks = {
            "threshold": self._check_threshold(process_id),
            "trend": self._check_trend(process_id),
            "yoy": self._check_yoy(process_id),
        }

        for check_name, check_fn in checks.items():
            if check_type == "ALL" or check_type.upper() == check_name.upper():
                alert = check_fn()
                if alert:
                    alerts.append(alert)

        return {
            "success": True,
            "data": {
                "process_id": process_id,
                "alerts_found": len(alerts),
                "alerts": alerts,
                "summary": "检测完成" if not alerts else f"发现 {len(alerts)} 条预警",
            }
        }

    def _check_threshold(self, process_id) -> Dict:
        """阈值检测"""
        values = {"1": 82500, "2": 165000, "3": 42000, "4": 4000, "5": 15832}
        threshold = values.get(str(process_id), 100000)
        # 模拟：10%概率触发
        if random.random() < 0.1:
            return {
                "alert_type": "THRESHOLD",
                "level": "YELLOW",
                "title": f"工序{process_id}排放超过日均值10%",
                "current_value": threshold * 1.1,
                "threshold_value": threshold,
            }
        return None

    def _check_trend(self, process_id) -> Dict:
        """趋势分析"""
        if random.random() < 0.15:
            return {
                "alert_type": "TREND",
                "level": "YELLOW",
                "title": f"工序{process_id}近7天排放持续上升",
                "trend_days": 7,
                "increase_rate": round(random.uniform(5, 15), 1),
            }
        return None

    def _check_yoy(self, process_id) -> Dict:
        """同比分析"""
        if random.random() < 0.1:
            return {
                "alert_type": "YOY",
                "level": "BLUE",
                "title": f"工序{process_id}同比排放增长{random.randint(8, 20)}%",
                "yoy_change": round(random.uniform(8, 20), 1),
            }
        return None
