"""
知识库Agent - 政策法规智能问答、标准规范检索（最新国家标准）
"""
from typing import Any, Dict, List
from app.agents.base_agent import BaseAgent, AgentRole, AgentContext


class KnowledgeBaseAgent(BaseAgent):
    """知识库Agent - 基于RAG的智能问答"""

    def __init__(self):
        super().__init__(
            name="知识库Agent",
            role=AgentRole.KNOWLEDGE_BASE,
            description="政策法规智能问答、标准规范检索（最新标准）"
        )
        # 内置知识库（最新国家标准）
        self._knowledge_base = [
            {
                "id": 1,
                "title": "GB/T 32150-2025《工业企业温室气体排放核算和报告通则》",
                "content": "工业企业温室气体排放核算和报告通则（2025年12月31日发布，2026年7月1日实施）。规定了工业企业温室气体排放核算的边界、排放源识别、活动数据收集、排放因子选取和排放量计算的方法。本标准是碳排放核算的最新基础标准，替代GB/T 32150-2015。",
                "category": "STANDARD",
                "keywords": ["核算", "标准", "GB/T 32150", "通则", "2025", "基础标准"],
                "version": "2025",
                "status": "2026年7月1日实施",
            },
            {
                "id": 2,
                "title": "GB/T 32151.5-2026《温室气体排放核算与报告要求 第5部分：钢铁生产企业》",
                "content": "钢铁生产企业温室气体排放核算与报告要求（2026年3月31日发布）。规定了钢铁企业碳排放核算边界、排放源、活动数据、排放因子和排放量计算方法。本标准替代GB/T 32151.5-2015，是钢铁行业纳入全国碳市场的核心核算依据。",
                "category": "STANDARD",
                "keywords": ["钢铁", "核算", "GB/T 32151.5", "2026", "行业要求"],
                "version": "2026",
                "status": "现行有效",
            },
            {
                "id": 3,
                "title": "全国碳排放权交易市场覆盖钢铁行业工作方案",
                "content": "生态环境部2025年3月26日正式发布，将钢铁行业纳入全国碳排放权交易市场。包含配额分配、交易规则、履约机制、MRV体系等。钢铁行业自2025年起正式纳入，2024、2025年度为首个配额周期。",
                "category": "POLICY",
                "keywords": ["碳交易", "配额", "市场", "履约", "钢铁纳入", "2025"],
                "version": "2025",
                "status": "现行有效",
            },
            {
                "id": 4,
                "title": "CBAM碳边境调节机制",
                "content": "欧盟碳边境调节机制（CBAM）要求进口商为其进口产品的隐含碳排放购买CBAM证书。钢铁产品在CBAM覆盖范围内。过渡期（2023-2025）仅需报告，2026年起需购买证书履约。",
                "category": "POLICY",
                "keywords": ["CBAM", "碳边境", "欧盟", "证书", "隐含碳", "钢铁"],
                "version": "2023",
                "status": "过渡期",
            },
            {
                "id": 5,
                "title": "钢铁行业碳达峰实施方案",
                "content": "工信部等三部委联合印发的钢铁行业碳达峰实施方案，要求2030年前钢铁行业实现碳达峰，2060年前实现碳中和。主要路径包括优化工艺结构、提升能效、发展短流程炼钢、推广氢冶金等。",
                "category": "GUIDE",
                "keywords": ["碳达峰", "钢铁", "方案", "2030", "碳中和"],
                "version": "2022",
                "status": "现行有效",
            },
            {
                "id": 6,
                "title": "2022年度电力二氧化碳排放因子（2024年12月发布）",
                "content": "生态环境部发布的2022年度全国电力二氧化碳排放因子：全国电力碳排放因子为0.5568 tCO2/MWh，华中区域电网因子为0.5810 tCO2/MWh（适用于湖南省）。",
                "category": "FACTOR",
                "keywords": ["电力", "排放因子", "电网", "0.5810", "2022", "湖南", "华中"],
                "version": "2024",
                "status": "现行有效",
            },
            {
                "id": 7,
                "title": "钢铁行业能耗标杆水平（2024年）",
                "content": "国家发改委发布的钢铁行业能耗标杆值：烧结工序53.3 kgce/t，炼铁工序370 kgce/t，炼钢工序-15 kgce/t（余能回收），轧钢工序45 kgce/t。低于标杆值的企业优先纳入碳市场配额分配。",
                "category": "GUIDE",
                "keywords": ["能耗", "标杆", "烧结", "炼铁", "炼钢", "轧钢", "kgce"],
                "version": "2024",
                "status": "现行有效",
            },
        ]

    def get_system_prompt(self) -> str:
        return """你是一个专业的碳排放知识库智能体。你可以回答关于碳排放核算标准、政策法规、排放因子、碳交易等方面的问题。

**重要提示**：
- 钢铁行业碳排放自2025年3月起正式纳入全国碳排放权交易市场（非2024年）
- 请优先引用最新标准（GB/T 32150-2025、GB/T 32151.5-2026）
- 排放因子请使用生态环境部2024年12月发布的2022年度数据
- 冷钢属于华中电网区域（湖南省），电力排放因子为0.5810 tCO2/MWh

回答要求：
1. 准确引用相关标准和政策（注明版本年份）
2. 提供具体的技术参数和计算方法
3. 如不确定，明确说明并建议查询方向
4. 回答应专业、简洁、有针对性"""

    def _search_knowledge(self, question: str) -> List[Dict]:
        """关键词匹配检索知识库"""
        results = []
        question_lower = question.lower()

        for doc in self._knowledge_base:
            score = 0
            # 关键词匹配
            for keyword in doc["keywords"]:
                if keyword.lower() in question_lower:
                    score += 1

            # 标题匹配
            if any(word in question for word in doc["title"] if len(word) > 1):
                score += 2

            # 优先推荐最新标准（2025/2026年）
            if doc.get("version") in ("2025", "2026"):
                score += 0.5

            if score > 0:
                results.append({**doc, "relevance": min(score / 5, 1.0)})

        # 按相关性排序
        results.sort(key=lambda x: x["relevance"], reverse=True)
        return results[:3]

    async def execute(self, context: AgentContext) -> Dict[str, Any]:
        """执行知识问答"""
        question = context.params.get("question", "")

        if not question:
            return {"success": False, "error": "问题不能为空"}

        self.logger.info(f"知识问答: {question}")

        # 检索相关知识
        relevant_docs = self._search_knowledge(question)

        # 生成回答（简化版，生产环境应调用LLM）
        if relevant_docs:
            answer_parts = [f"关于「{question}」，根据相关资料：\n\n"]
            for doc in relevant_docs:
                version_info = f"[{doc.get('version', 'N/A')}版]" if doc.get('version') else ""
                status_info = f"（{doc.get('status', '现行')}）" if doc.get('status') else ""
                answer_parts.append(f"**{doc['title']}** {version_info} {status_info}\n{doc['content']}\n\n")

            answer = "".join(answer_parts)
            sources = [{
                "documentId": d["id"],
                "title": d["title"],
                "version": d.get("version", "N/A"),
                "relevance": d["relevance"]
            } for d in relevant_docs]
            else:
            answer = f"抱歉，未找到与「{question}」相关的知识。建议您查阅GB/T 32150-2025标准或咨询专业机构。"
            sources = []

        return {
            "success": True,
            "data": {
                "answer": answer,
                "sources": sources,
                "conversation_id": context.conversation_id or f"conv_{id(context)}",
            }
        }
