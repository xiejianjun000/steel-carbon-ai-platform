# 冷钢碳排放AI智慧管理平台 - 工序智能体详细设计（修正版）

**编制日期**：2026年5月13日  
**设计依据**：基于冷钢2025年实际生产数据  
**适用标准**：GB/T 32150-2025 + GB/T 32151.5-2026

---

## 适用标准说明

> ⚠️ **重要更新（2026年5月13日）**
> 
> 1. **数据来源**：本系统使用冷钢2025年真实生产数据（非模拟数据）
> 2. **标准规范**：钢铁行业碳排放自2025年3月起纳入全国碳市场，采用最新标准：
>    - GB/T 32150-2025 温室气体排放核算通则（基础标准）
>    - **GB/T 32151.5-2026 钢铁生产企业温室气体排放核算与报告要求（替代旧版）**
>    - 生态环境部2024年电网排放因子（华中电网0.5810 tCO2/MWh）

---

## 一、冷钢实际工序结构确认

### 1.1 企业实际工序清单

根据冷钢2025年度生产数据，确认以下工序结构：

| 序号 | 工序 | 主要设备 | 产品 | 碳排放范围 | 备注 |
|------|------|----------|------|-----------|------|
| 1 | **辅助原料煅烧** | 竖窑 | 石灰 | ✅ 纳入 | 石灰窑 |
| 2 | **烧结** | 2×180m²烧结机 | 烧结矿 | ✅ 纳入 | - |
| 3 | **炼铁** | 4#5#高炉(530m³) | 生铁 | ✅ 纳入 | - |
| 4 | **炼钢** | 1#2#3#转炉(70t) | 粗钢 | ✅ 纳入 | - |
| 5 | **轧钢** | 棒材/线材线 | 钢材 | ✅ 纳入 | - |
| 6 | **焦化** | - | - | ❌ **无此工序** | 焦炭外购 |

### 1.2 修正说明

```
⚠️ 重要修正：

1. ❌ 取消焦化工序智能体
   - 冷钢无焦炉，焦炭全部外购
   - 焦炭消耗作为原料投入核算

2. ✅ 新增石灰窑（辅助原料煅烧）工序
   - 竖窑煅烧石灰
   - 有碳排放（石灰石分解）
   
3. ✅ 最终确定5大工序Agent
   - 石灰窑Agent（新增）
   - 烧结Agent
   - 炼铁Agent
   - 炼钢Agent
   - 轧钢Agent
```

---

## 二、冷钢5大工序核心参数（2025年数据）

### 2.1 石灰窑（辅助原料煅烧）

```json
{
  "process": "auxiliary_material_calcination",
  "name": "辅助原料煅烧（石灰窑）",
  "equipment": "竖窑",
  "product": "石灰",
  "production_2025": 7738.84,  // 1月数据，累计需×12
  "keyParameters": {
    "煅烧产品工序单位能耗": {"value": 169.38, "unit": "kgce/t", "source": "钢协月报"},
    "电力单耗": {"value": 92.22, "unit": "kWh/t"},
    "高炉煤气消耗": {"value": 1475.60, "unit": "m³/t"}
  },
  "emissionFactor": {
    "limestone": 0.4400,      // tCO₂/t 石灰石分解 (GB/T 32150-2025 附录B)
    "electricity": 0.5810,    // tCO₂/MWh (生态环境部2024年电网因子)
    "blastFurnaceGas": 1.57   // tCO₂/万m³ (GB/T 32150-2025)
  },
  "emissionRatio": "~2%",     // 约占总排放2%
  "dataSource": "E:\\冷钢碳排放基础资料\\2025年钢协经济技术指标(碳排放1.12）.xls"
}
```

### 2.2 烧结工序

```json
{
  "process": "sintering",
  "name": "烧结工序",
  "equipment": "2×180m²烧结机",
  "product": "烧结矿",
  "production_2025_1month": 237932.8,  // 吨
  "keyParameters": {
    "烧结矿产量": {"value": 237932.8, "unit": "t/月", "dataId": "f4d107d8-3658-4f49-bd54-23be82617843"},
    "烧结矿合格率": {"value": 14.51, "unit": "%"},
    "烧结矿碱度": {"value": 1.876, "unit": "倍"},
    "固体燃料消耗": {"value": 56.87, "unit": "kg/t", "dataId": "f4d107d8-3658-4f49-bd54-23be82617850"},
    "固体燃料消耗_干量": {"value": 48.71, "unit": "kg/t"},
    "焦粉消耗": {"value": 27.45, "unit": "kg/t", "dataId": "f4d107d8-3658-4f49-bd54-23be82618151"},
    "石灰石消耗": {"value": 132.02, "unit": "kg/t"},
    "生石灰消耗": {"value": 16.81, "unit": "kg/t"},
    "返矿率": {"value": 13.13, "unit": "%"},
    "出矿率": {"value": 97.83, "unit": "%"},
    "工序单位能耗": {"value": 53.37, "unit": "kgce/t"}
  },
  "emissionFactor": {
    "cokeBreeze": 3.04,       // tCO₂/t 焦粉
    "limestone": 0.44,         // tCO₂/t 石灰石
    "electricity": 0.5810      // tCO₂/MWh
  },
  "emissionRatio": "~8%",
  "carbonEmissionFormula": "E_烧结 = 焦粉消耗×3.04 + 石灰石×0.44 + 电力×0.5810"
}
```

### 2.3 炼铁工序

```json
{
  "process": "ironmaking",
  "name": "炼铁工序",
  "equipment": "4#5#高炉(530m³)",
  "product": "生铁",
  "production_2025_1month": 121248.88,  // 吨
  "keyParameters": {
    "生铁产量": {"value": 121248.88, "unit": "t/月"},
    "焦炭消耗": {"value": 49873, "unit": "t/月", "dataId": "f4d107d8-3658-4f49-bd54-23be82617874"},
    "焦炭(干量)": {"value": 46671.15, "unit": "t/月"},
    "入炉焦比": {"value": 411.33, "unit": "kg/tFe", "dataId": "f4d107d8-3658-4f49-bd54-23be82617874"},
    "喷煤比": {"value": 536.71, "unit": "kg/tFe"},  // 4#高炉
    "综合焦比": {"value": 501.34, "unit": "kg/tFe"},
    "燃料比": {"value": 527.94, "unit": "kg/tFe"},
    "高炉煤气产出": {"value": 1780, "unit": "m³/t"},
    "高炉煤气消费": {"value": 765.40, "unit": "m³/t"},
    "TRT发电": {"value": 44.73, "unit": "kWh/t"},
    "热风温度": {"value": 1150, "unit": "℃"},
    "高炉有效容积利用系数": {"value": 3.69, "unit": "t/m³.d"}
  },
  "emissionFactor": {
    "coke": 3.04,             // tCO₂/t 焦炭
    "coalInjection": 2.66,     // tCO₂/t 喷煤
    "blastFurnaceGas": 1.57,   // tCO₂/万m³
    "processEmission": 1.33    // tCO₂/tFe 过程排放
  },
  "emissionRatio": "~45%",     // 占总排放最高
  "carbonEmissionFormula": "E_炼铁 = 焦炭×3.04 + 喷煤×2.66 + 生铁×1.33 - 煤气回收×1.57"
}
```

### 2.4 炼钢工序

```json
{
  "process": "steelmaking",
  "name": "炼钢工序",
  "equipment": "1#2#3#转炉(70t)",
  "product": "粗钢",
  "production_2025_1month": 129904.28,  // 吨
  "keyParameters": {
    "粗钢产量": {"value": 129904.28, "unit": "t/月"},
    "钢铁料消耗": {"value": 1085.72, "unit": "kg/t"},
    "高炉铁水消耗": {"value": 933.37, "unit": "kg/t"},
    "转炉煤气回收": {"value": 97.00, "unit": "m³/t", "dataId": "f4d107d8-3658-4f49-bd54-23be82617877"},
    "冶金石灰消耗": {"value": 28.79, "unit": "kg/t"},
    "转炉日历作业率": {"value": 36.36, "unit": "%"},
    "连铸比": {"value": 100, "unit": "%"},
    "工序单位能耗": {"value": -16.12, "unit": "kgce/t"}  // 余能回收，负值
  },
  "emissionFactor": {
    "limestone": 0.44,         // tCO₂/t 石灰石
    "converterGas": 2.20,       // tCO₂/万m³ 转炉煤气
    "electricity": 0.5810      // tCO₂/MWh
  },
  "emissionRatio": "~8%",
  "carbonEmissionFormula": "E_炼钢 = 石灰石×0.44 + 电力×0.5810 - 转炉煤气回收×2.20"
}
```

### 2.5 轧钢工序

```json
{
  "process": "rolling",
  "name": "轧钢工序",
  "equipment": "棒材/线材生产线",
  "product": "钢材",
  "production_2025_1month": 122970.03,  // 吨
  "keyParameters": {
    "钢材产量": {"value": 122970.03, "unit": "t/月"},
    "热轧钢材合格率": {"value": 99.95, "unit": "%"},
    "成材率": {"value": 97.5, "unit": "%"},
    "天然气消耗": {"value": 12.5, "unit": "m³/t"},  // 估算值
    "电力消耗": {"value": 80, "unit": "kWh/t"},  // 估算值
    "余热回收": {"value": 0.02, "unit": "GJ/t"}
  },
  "equipmentList": [
    {"name": "1#钢筋轧机（550，一轧车间）", "capacity": 24144.9, "unit": "t"},
    {"name": "2#钢筋轧机（610，二轧车间）", "capacity": 51110.9, "unit": "t"},
    {"name": "1#线材轧机（450，高线车间）", "capacity": 47714.2, "unit": "t"}
  ],
  "emissionFactor": {
    "naturalGas": 2.16,         // tCO₂/t 天然气
    "electricity": 0.5810      // tCO₂/MWh
  },
  "emissionRatio": "~5%",
  "carbonEmissionFormula": "E_轧钢 = 天然气×2.16 + 电力×0.5810"
}
```

---

## 三、5大工序AI智能体架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    冷钢碳排放AI智慧管理平台 - 5大工序Agent                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              Hermes Agent (统一调度 + 四层记忆 + 自进化)               │    │
│  │  能力：自然语言理解 / 任务编排 / 长期记忆 / 技能生成 / 自我优化         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              OpenClaw Agent Gateway (A2A协作 + 工作区隔离)           │    │
│  │  能力：多Agent通信 / 权限控制 / 会话管理 / 技能共享                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│         ┌──────────────────────────┼──────────────────────────┐            │
│         │                          │                          │            │
│         ▼                          ▼                          ▼            │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐   │
│  │  通用碳管理    │      │  5大工序Agent   │      │  协同优化      │   │
│  │  Agent集群     │      │  Agent集群     │      │  Agent集群     │   │
│  │                 │      │                 │      │                 │   │
│  │ • 碳核算      │      │ • 石灰窑Agent │      │ • 碳配额优化  │   │
│  │ • 碳监测      │◀─A2A─▶│ • 烧结Agent   │◀─A2A─▶│ • 能耗优化    │   │
│  │ • 碳交易      │      │ • 炼铁Agent   │      │ • 预测分析    │   │
│  │ • CBAM合规    │      │ • 炼钢Agent   │      │ • 减排策略    │   │
│  │ • 核查辅助    │      │ • 轧钢Agent   │      │                 │   │
│  │ • 知识库      │      │                 │      │                 │   │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 工序Agent能力矩阵

| Agent | 碳排放占比 | 核心功能 | 优化潜力 | 数据来源 |
|-------|-----------|----------|----------|----------|
| **石灰窑Agent** | ~2% | 石灰石分解排放监控、竖窑效率优化 | 中 | 竖窑仪表 |
| **烧结Agent** | ~8% | 燃料消耗监控、返矿率优化、SO₂减排 | 高 | 烧结MES |
| **炼铁Agent** | ~45% | 焦比/煤比优化、热风炉管理、TRT发电 | **最高** | 高炉DCS |
| **炼钢Agent** | ~8% | 煤气回收监控、石灰消耗优化、连铸比 | 高 | 转炉PLC |
| **轧钢Agent** | ~5% | 燃气消耗优化、成材率提升、余热回收 | 中 | 轧钢系统 |

---

## 四、5大工序Agent详细代码设计

### 4.1 工序枚举与配置

```python
# ai-agent/app/agents/process/enums.py

from enum import Enum

class ProcessType(Enum):
    """冷钢5大工序枚举"""
    LIMESTONE_KILN = "limestone_kiln"     # 石灰窑（辅助原料煅烧）
    SINTERING = "sintering"               # 烧结
    IRONMAKING = "ironmaking"              # 炼铁
    STEELMAKING = "steelmaking"            # 炼钢
    ROLLING = "rolling"                    # 轧钢

class EmissionSource(Enum):
    """排放源类型"""
    FUEL_COMBUSTION = "fuel_combustion"    # 燃料燃烧
    PROCESS_EMISSION = "process_emission"  # 过程排放
    ELECTRICITY = "electricity"            # 电力

class AlertLevel(Enum):
    """告警级别"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
```

### 4.2 石灰窑Agent

```python
# ai-agent/app/agents/process/limestone_kiln_agent.py

"""
石灰窑（辅助原料煅烧）AI智能体

冷钢石灰窑采用竖窑工艺，用于煅烧石灰石生产石灰。
碳排放主要来源：
1. 石灰石分解（CaCO₃ → CaO + CO₂）
2. 燃气加热消耗（高炉煤气）
3. 电力消耗（破碎、提升风机等）

关键工艺参数：
- 煅烧产品工序单位能耗：~169 kgce/t
- 电力单耗：~92 kWh/t
- 高炉煤气消耗：~1476 m³/t
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field
import math

from .base_process_agent import BaseProcessAgent, ProcessAgentConfig, ProcessType

class LimestoneKilnAgent(BaseProcessAgent):
    """
    石灰窑AI智能体
    
    核心功能：
    1. 石灰产量与碳排放核算
    2. 石灰石分解排放监控
    3. 竖窑热效率优化
    4. 燃气消耗优化建议
    5. 质量预测（生过烧率）
    """
    
    # 排放因子（GB/T 32150标准）
    EMISSION_FACTORS = {
        "limestone_decomposition": 0.44,   # tCO₂/t 石灰石分解（CaCO₃→CO₂）
        "blast_furnace_gas": 1.57,          # tCO₂/万m³ 高炉煤气
        "natural_gas": 2.16,                # tCO₂/t 天然气
        "electricity": 0.5810               # tCO₂/MWh 电网电力
    }
    
    # 化学反应排放因子（理论计算）
    # CaCO₃ → CaO + CO₂
    # 分子量：CaCO₃=100, CO₂=44
    # 每吨石灰石（纯CaCO₃）分解产生：440kg CO₂
    LIMESTONE_CARBON_FACTOR = 0.44  # tCO₂/t石灰石
    
    # 冷钢竖窑正常工艺参数范围
    NORMAL_RANGES = {
        "煅烧产品工序单位能耗": (150, 180),      # kgce/t
        "电力单耗": (85, 100),                   # kWh/t
        "高炉煤气单耗": (1400, 1550),            # m³/t
        "生过烧率": (5, 15),                     # %
        "活性度": (300, 380),                    # mL(4N-HCl)
        "日历作业率": (85, 95)                    # %
    }
    
    def __init__(self):
        config = ProcessAgentConfig(
            name="石灰窑碳排放Agent",
            process_type=ProcessType.LIMESTONE_KILN,
            description="石灰窑（辅助原料煅烧）碳排放监测与优化",
            key_parameters=[
                "煅烧产品产量",
                "石灰石消耗",
                "电力单耗",
                "高炉煤气单耗",
                "日历作业率"
            ],
            emission_sources=[
                "石灰石分解过程排放",
                "高炉煤气燃烧排放",
                "电力消耗隐含排放"
            ],
            normal_ranges=self.NORMAL_RANGES
        )
        super().__init__(config)
        
        # 石灰窑专业知识
        self.limestone_knowledge = {
            "最佳煅烧温度": "900-1100℃",
            "降低能耗方法": [
                "提高石灰石入窑粒度均匀性",
                "优化布料制度，确保均匀分布",
                "控制合理的煅烧带位置",
                "提高煤气热值和燃烧效率"
            ],
            "质量控制要点": [
                "石灰石MgO含量控制",
                "煅烧温度和时间控制",
                "冷却速度控制"
            ]
        }
    
    async def calculate_emission(self, activity_data: Dict[str, float]) -> Dict[str, float]:
        """
        石灰窑碳排放计算
        
        公式：
        E_石灰窑 = 石灰石分解排放 + 高炉煤气排放 + 电力排放
        
        石灰石分解排放 = 石灰石消耗量 × 0.44 tCO₂/t
        （基于CaCO₃→CO₂化学反应）
        
        Args:
            activity_data: {
                "石灰产量": t,
                "石灰石消耗": t,
                "高炉煤气消耗": 万m³,
                "电力消耗": MWh,
                "日历作业率": %
            }
        """
        output = activity_data.get("石灰产量", 0)  # t
        limestone_consumption = activity_data.get("石灰石消耗", 0)  # t
        
        # 1. 石灰石分解过程排放（主要排放源）
        # CaCO₃ → CaO + CO₂，分子量比 44/100
        limestone_emission = limestone_consumption * self.EMISSION_FACTORS["limestone_decomposition"]
        
        # 2. 高炉煤气燃烧排放
        bf_gas_consumption = activity_data.get("高炉煤气消耗", 0)  # 万m³
        bf_gas_emission = bf_gas_consumption * self.EMISSION_FACTORS["blast_furnace_gas"]
        
        # 3. 电力消耗隐含排放
        electricity = activity_data.get("电力消耗", 0)  # MWh
        power_emission = electricity * self.EMISSION_FACTORS["electricity"]
        
        total_emission = limestone_emission + bf_gas_emission + power_emission
        
        # 计算强度
        intensity = total_emission / output if output > 0 else 0
        
        # 理论石灰石消耗（基于石灰产量和理论转化率）
        theoretical_limestone = output / 0.56  # 石灰收得率约56%
        
        return {
            "石灰石分解排放": round(limestone_emission, 2),
            "高炉煤气燃烧排放": round(bf_gas_emission, 2),
            "电力隐含排放": round(power_emission, 2),
            "总排放量": round(total_emission, 2),
            "碳排放强度": round(intensity, 4),
            "吨灰能耗_kgce": round(activity_data.get("煅烧产品工序单位能耗", 0), 2),
            "日历作业率": round(activity_data.get("日历作业率", 0), 2),
            "单位": "tCO₂"
        }
    
    async def calculate_limestone_quality(self, params: Dict[str, float]) -> Dict[str, Any]:
        """
        计算石灰质量指标
        
        基于煅烧参数预测石灰质量
        """
        temperature = params.get("煅烧温度", 1050)  # ℃
        residence_time = params.get("煅烧时间", 8)  # h
        limestone_size = params.get("石灰石粒度", 50)  # mm
        
        # 简化质量评分模型
        quality_score = 100
        
        # 温度影响
        if temperature < 900:
            quality_score -= 20  # 欠烧
        elif temperature > 1150:
            quality_score -= 15  # 过烧
        
        # 时间影响
        if residence_time < 6:
            quality_score -= 15  # 煅烧不足
        
        # 活性度预测
        predicted_activity = 320 + (temperature - 1000) * 0.1 - (residence_time - 8) * 5
        
        return {
            "质量评分": max(0, round(quality_score, 1)),
            "预测活性度": round(predicted_activity, 0),
            "质量等级": "优" if quality_score >= 90 else "良" if quality_score >= 75 else "合格",
            "建议": "调整煅烧参数以提高质量" if quality_score < 90 else "质量处于良好水平"
        }
    
    async def generate_optimization_suggestions(self,
                                                 current_params: Dict[str, float]) -> List[str]:
        """生成石灰窑优化建议"""
        suggestions = []
        
        energy_consumption = current_params.get("煅烧产品工序单位能耗", 180)
        if energy_consumption > 165:
            suggestions.append(f"当前工序能耗{energy_consumption}kgce/t偏高，建议：")
            suggestions.append("1. 优化煤气热值，减少不完全燃烧损失")
            suggestions.append("2. 提高石灰石入窑前的预热效率")
            suggestions.append("3. 优化布料制度，确保煅烧均匀")
            suggestions.append("4. 加强窑体保温，减少散热损失")
        
        bf_gas_consumption = current_params.get("高炉煤气单耗", 1500)
        if bf_gas_consumption > 1450:
            suggestions.append(f"高炉煤气消耗{bf_gas_consumption}m³/t偏高，可通过提高热效率降低")
        
        return suggestions
    
    async def calculate_theoretical_emission(self, limestone_purity: float = 0.95) -> Dict[str, float]:
        """
        计算理论碳排放
        
        基于石灰石纯度计算理论分解排放
        
        Args:
            limestone_purity: 石灰石CaCO₃含量（默认95%）
            
        Returns:
            理论排放因子
        """
        # 纯CaCO₃分解：100g → 44g CO₂
        # 纯度95%的石灰石：排放因子 = 0.95 × 0.44 = 0.418 tCO₂/t
        theoretical_factor = limestone_purity * 0.44
        
        return {
            "石灰石纯度": limestone_purity,
            "理论排放因子": round(theoretical_factor, 4),
            "实际排放因子": self.EMISSION_FACTORS["limestone_decomposition"],
            "差异": round(self.EMISSION_FACTORS["limestone_decomposition"] - theoretical_factor, 4),
            "单位": "tCO₂/t石灰石"
        }
```

### 4.3 烧结Agent

```python
# ai-agent/app/agents/process/sintering_agent.py

"""
烧结工序AI智能体

冷钢烧结采用2×180m²烧结机，主要产品为烧结矿。
碳排放主要来源：
1. 固体燃料燃烧（焦粉、无烟煤等）
2. 电力消耗（风机、除尘等）
3. 过程排放（石灰石分解等）

关键工艺参数（2025年1月数据）：
- 烧结矿产量：237,932.8 t/月
- 固体燃料消耗：56.87 kg/t
- 焦粉消耗：27.45 kg/t
- 返矿率：13.13%
- 碱度：1.876倍
"""

from typing import Dict, List, Any
from .base_process_agent import BaseProcessAgent, ProcessAgentConfig, ProcessType

class SinteringAgent(BaseProcessAgent):
    """
    烧结AI智能体
    
    核心功能：
    1. 烧结矿产量与碳排放核算
    2. 固体燃料消耗监控
    3. 返矿率优化建议
    4. 碱度控制
    5. 烧结矿质量预测
    """
    
    EMISSION_FACTORS = {
        "coke_breeze": 3.04,          # tCO₂/t 焦粉
        "anthracite": 2.54,           # tCO₂/t 无烟煤
        "limestone": 0.44,            # tCO₂/t 石灰石分解
        "electricity": 0.5810         # tCO₂/MWh
    }
    
    NORMAL_RANGES = {
        "固体燃料消耗": (50, 60),         # kg/t
        "焦粉消耗": (25, 35),             # kg/t
        "返矿率": (10, 15),               # %
        "碱度": (1.7, 2.0),               # 倍
        "出矿率": (97, 99),               # %
        "垂直烧结速度": (20, 35),          # mm/min
        "料层厚度": (600, 800)            # mm
    }
    
    def __init__(self):
        config = ProcessAgentConfig(
            name="烧结碳排放Agent",
            process_type=ProcessType.SINTERING,
            description="烧结工序碳排放监测与优化",
            key_parameters=[
                "烧结矿产量",
                "固体燃料消耗",
                "焦粉消耗",
                "石灰石消耗",
                "返矿率"
            ],
            emission_sources=[
                "焦粉燃烧排放",
                "无烟煤燃烧排放",
                "石灰石分解排放",
                "电力消耗隐含排放"
            ],
            normal_ranges=self.NORMAL_RANGES
        )
        super().__init__(config)
    
    async def calculate_emission(self, activity_data: Dict[str, float]) -> Dict[str, float]:
        """
        烧结碳排放计算
        
        公式：
        E_烧结 = 焦粉×3.04 + 无烟煤×2.54 + 石灰石×0.44 + 电力×0.5810
        
        Args:
            activity_data: {
                "烧结矿产量": t,
                "焦粉消耗": t,
                "无烟煤消耗": t,
                "石灰石消耗": t,
                "电力消耗": MWh,
                "返矿率": %
            }
        """
        output = activity_data.get("烧结矿产量", 0)  # t
        
        # 1. 焦粉燃烧排放
        coke_breeze = activity_data.get("焦粉消耗", 0)  # t
        coke_emission = coke_breeze * self.EMISSION_FACTORS["coke_breeze"]
        
        # 2. 无烟煤燃烧排放
        anthracite = activity_data.get("无烟煤消耗", 0)  # t
        anthracite_emission = anthracite * self.EMISSION_FACTORS["anthracite"]
        
        # 3. 石灰石分解排放
        limestone = activity_data.get("石灰石消耗", 0)  # t
        limestone_emission = limestone * self.EMISSION_FACTORS["limestone"]
        
        # 4. 电力隐含排放
        electricity = activity_data.get("电力消耗", 0)  # MWh
        power_emission = electricity * self.EMISSION_FACTORS["electricity"]
        
        total_emission = coke_emission + anthracite_emission + limestone_emission + power_emission
        
        # 计算关键指标
        solid_fuel_rate = activity_data.get("固体燃料消耗", 0)  # kg/t
        return_rate = activity_data.get("返矿率", 0)  # %
        
        return {
            "焦粉燃烧排放": round(coke_emission, 2),
            "无烟煤燃烧排放": round(anthracite_emission, 2),
            "石灰石分解排放": round(limestone_emission, 2),
            "电力隐含排放": round(power_emission, 2),
            "总排放量": round(total_emission, 2),
            "碳排放强度": round(total_emission / output, 4) if output > 0 else 0,
            "固体燃料单耗": round(solid_fuel_rate, 2),
            "返矿率": round(return_rate, 2),
            "单位": "tCO₂"
        }
    
    async def calculate_coke_ratio_optimization(self,
                                                current_params: Dict[str, float],
                                                target_ratio: float = 50) -> Dict[str, Any]:
        """
        计算焦粉比优化空间
        
        基于当前参数计算降低焦粉消耗的潜力
        """
        current_coke_rate = current_params.get("焦粉消耗", 30)  # kg/t
        output = current_params.get("烧结矿产量", 100000)  # t
        
        gap = current_coke_rate - target_ratio
        annual_output = output * 12  # 年化产量
        potential_reduction = (gap / 1000) * annual_output  # t焦粉
        
        # 碳减排计算
        # 焦粉排放因子 3.04 tCO₂/t
        annual_carbon_reduction = potential_reduction * 3.04  # tCO₂
        
        return {
            "当前焦粉单耗": current_coke_rate,
            "目标焦粉单耗": target_ratio,
            "差距": gap,
            "年化减排潜力_tCO₂": round(annual_carbon_reduction, 2),
            "年化经济效益_万元": round(annual_carbon_reduction * 0.01, 2),  # 碳价100元/t估算
            "优化建议": [
                "提高铁矿粉配比，减少焦粉用量",
                "优化燃料粒度分布",
                "提高料层厚度至750mm以上",
                "采用分层布料技术"
            ]
        }
    
    async def predict_quality(self, params: Dict[str, float]) -> Dict[str, Any]:
        """预测烧结矿质量"""
        alkalinity = params.get("碱度", 1.8)
        fuel_rate = params.get("固体燃料消耗", 55)
        
        # 转鼓指数预测
        tumble_index = 60 + (alkalinity - 1.8) * 15 - (fuel_rate - 55) * 0.3
        
        return {
            "预测转鼓指数": round(tumble_index, 1),
            "预测落下强度": round(tumble_index * 0.95, 1),
            "碱度": round(alkalinity, 3),
            "质量等级": "优" if tumble_index >= 65 else "良" if tumble_index >= 60 else "合格"
        }
    
    async def generate_optimization_suggestions(self,
                                                 current_params: Dict[str, float]) -> List[str]:
        """生成烧结优化建议"""
        suggestions = []
        
        fuel_rate = current_params.get("固体燃料消耗", 60)
        if fuel_rate > 55:
            suggestions.append(f"固体燃料消耗{fuel_rate}kg/t偏高，建议：")
            suggestions.append("1. 优化配矿方案，提高低价铁矿配比")
            suggestions.append("2. 适当提高料层厚度至750mm")
            suggestions.append("3. 优化点火温度和时间")
            suggestions.append("4. 稳定混合料水分")
        
        return_rate = current_params.get("返矿率", 15)
        if return_rate > 12:
            suggestions.append(f"返矿率{return_rate}%偏高，建议：")
            suggestions.append("1. 控制燃料粒度，减少过烧")
            suggestions.append("2. 稳定烧结速度")
            suggestions.append("3. 优化布料均匀性")
        
        return suggestions
```

### 4.4 炼铁Agent

```python
# ai-agent/app/agents/process/ironmaking_agent.py

"""
炼铁工序AI智能体

冷钢炼铁采用4#5#高炉(530m³)，主要产品为生铁。
碳排放占全流程最高（约45%），是节能降碳的重点工序。

碳排放主要来源：
1. 焦炭燃烧（碳与氧反应）
2. 喷吹煤粉燃烧
3. 高炉内铁矿石还原反应（过程排放）
4. 热风炉燃气消耗

关键工艺参数（2025年1月数据）：
- 生铁产量：121,248.88 t/月
- 焦炭消耗：49,873 t（干量46,671 t）
- 入炉焦比：411.33 kg/tFe
- 喷煤比：536.71 kg/tFe（4#高炉）
- 综合焦比：501.34 kg/tFe
- 高炉煤气产出：1780 m³/t
- TRT发电：44.73 kWh/t
"""

from typing import Dict, List, Any
from .base_process_agent import BaseProcessAgent, ProcessAgentConfig, ProcessType

class IronMakingAgent(BaseProcessAgent):
    """
    炼铁AI智能体
    
    核心功能：
    1. 生铁产量与碳排放核算（占比最高）
    2. 焦比/煤比优化建议
    3. 高炉透气性监控
    4. 热风炉燃气优化
    5. TRT发电效益计算
    6. 铁水质量预测
    """
    
    EMISSION_FACTORS = {
        "coke": 3.04,                 # tCO₂/t 焦炭
        "coal_injection": 2.66,        # tCO₂/t 喷吹煤粉
        "blast_furnace_gas": 1.57,     # tCO₂/万m³ 高炉煤气
        "natural_gas": 2.16,           # tCO₂/t 天然气
        "electricity": 0.5810,         # tCO₂/MWh
        "process_emission": 1.33       # tCO₂/tFe 高炉过程排放
    }
    
    # 2025年实际参数
    ACTUAL_PARAMS_2025 = {
        "生铁产量_1月": 121248.88,
        "焦炭消耗_1月": 49873,
        "入炉焦比": 411.33,
        "喷煤比": 536.71,
        "综合焦比": 501.34,
        "燃料比": 527.94,
        "TRT发电": 44.73
    }
    
    NORMAL_RANGES = {
        "入炉焦比": (380, 450),           # kg/tFe
        "喷煤比": (100, 200),             # kg/tFe
        "综合焦比": (480, 530),           # kg/tFe
        "燃料比": (500, 560),             # kg/tFe
        "热风温度": (1100, 1250),         # ℃
        "炉顶温度": (150, 300),           # ℃
        "透气性指数": (2500, 4000),       # -
        "铁水温度": (1450, 1550)          # ℃
    }
    
    def __init__(self):
        config = ProcessAgentConfig(
            name="炼铁碳排放Agent",
            process_type=ProcessType.IRONMAKING,
            description="炼铁工序碳排放监测与优化（占比最高，约45%）",
            key_parameters=[
                "生铁产量",
                "焦炭消耗",
                "入炉焦比",
                "喷煤比",
                "综合焦比",
                "高炉煤气回收"
            ],
            emission_sources=[
                "焦炭燃烧排放",
                "喷煤燃烧排放",
                "高炉过程排放（还原反应）",
                "热风炉燃气排放",
                "高炉煤气回收抵减"
            ],
            normal_ranges=self.NORMAL_RANGES
        )
        super().__init__(config)
        
        # 炼铁专业知识
        self.ironmaking_knowledge = {
            "降低焦比方法": [
                "提高风温至1250℃以上",
                "提高喷煤比至150kg/tFe以上",
                "使用高品位铁矿",
                "优化布料制度",
                "提高煤气利用率"
            ],
            "TRT发电效益": "TRT每发1kWh电可减少外购电力约0.6kgCO₂",
            "碳排放强度目标": "先进值<1.4 tCO₂/tFe"
        }
    
    async def calculate_emission(self, activity_data: Dict[str, float]) -> Dict[str, float]:
        """
        炼铁碳排放计算
        
        公式：
        E_炼铁 = 焦炭×3.04 + 喷煤×2.66 + 生铁×1.33 + 热风炉燃气 - 煤气回收×1.57×0.5
        
        说明：
        - 焦炭、喷煤直接燃烧排放
        - 1.33为高炉内铁矿石还原过程排放
        - 煤气回收利用按50%抵减
        
        Args:
            activity_data: {
                "生铁产量": t,
                "焦炭消耗": t,
                "喷煤消耗": t,
                "高炉煤气回收": 万m³,
                "天然气消耗": t,
                "电力消耗": MWh
            }
        """
        output = activity_data.get("生铁产量", 0)  # t
        
        # 1. 焦炭燃烧排放
        coke_consumption = activity_data.get("焦炭消耗", 0)  # t
        coke_emission = coke_consumption * self.EMISSION_FACTORS["coke"]
        
        # 2. 喷煤燃烧排放
        coal_injection = activity_data.get("喷煤消耗", 0)  # t
        coal_emission = coal_injection * self.EMISSION_FACTORS["coal_injection"]
        
        # 3. 高炉过程排放（铁矿石还原）
        process_emission = output * self.EMISSION_FACTORS["process_emission"]
        
        # 4. 热风炉燃气排放
        natural_gas = activity_data.get("天然气消耗", 0)  # t
        gas_emission = natural_gas * self.EMISSION_FACTORS["natural_gas"]
        
        # 5. 电力排放（非TRT发电部分）
        electricity = activity_data.get("电力消耗", 0)  # MWh
        trt_generation = activity_data.get("TRT发电量", 0)  # MWh（自发电）
        net_electricity = max(0, electricity - trt_generation)  # 净购入电力
        power_emission = net_electricity * self.EMISSION_FACTORS["electricity"]
        
        # 6. 高炉煤气回收抵减（回收利用率约50%）
        recovered_gas = activity_data.get("高炉煤气回收", 0)  # 万m³
        gas_credit = recovered_gas * self.EMISSION_FACTORS["blast_furnace_gas"] * 0.5
        
        total_emission = (coke_emission + coal_emission + process_emission + 
                         gas_emission + power_emission - gas_credit)
        
        # 计算关键指标
        coke_ratio = (coke_consumption / output * 1000) if output > 0 else 0
        coal_ratio = (coal_injection / output * 1000) if output > 0 else 0
        
        return {
            "焦炭燃烧排放": round(coke_emission, 2),
            "喷煤燃烧排放": round(coal_emission, 2),
            "高炉过程排放": round(process_emission, 2),
            "热风炉燃气排放": round(gas_emission, 2),
            "电力隐含排放": round(power_emission, 2),
            "高炉煤气回收抵减": round(-gas_credit, 2),
            "总排放量": round(total_emission, 2),
            "碳排放强度": round(total_emission / output, 4) if output > 0 else 0,
            "入炉焦比_kg/tFe": round(coke_ratio, 2),
            "喷煤比_kg/tFe": round(coal_ratio, 2),
            "单位": "tCO₂"
        }
    
    async def calculate_coke_ratio_optimization(self,
                                               current_params: Dict[str, float],
                                               target_coke_ratio: float = 380) -> Dict[str, Any]:
        """
        计算焦比优化潜力
        
        焦比每降低10kg/tFe，吨铁碳排放减少约30kgCO₂
        """
        current_coke_ratio = current_params.get("入炉焦比", 411)  # kg/tFe
        output = current_params.get("生铁产量", 121000)  # t
        
        gap = current_coke_ratio - target_coke_ratio
        annual_output = output * 12
        potential_coke_reduction = (gap / 1000) * annual_output  # t焦炭
        
        # 碳减排计算
        annual_carbon_reduction = potential_coke_reduction * 3.04  # tCO₂
        
        return {
            "当前入炉焦比": current_coke_ratio,
            "目标入炉焦比": target_coke_ratio,
            "差距_kg/tFe": gap,
            "年化焦炭节约_t": round(potential_coke_reduction, 0),
            "年化碳减排_tCO₂": round(annual_carbon_reduction, 0),
            "年化经济效益_万元": round(annual_carbon_reduction * 0.03, 0),  # 碳价300元/t
            "优化措施": [
                "提高风温至1250℃以上",
                "提高喷煤比至150kg/tFe以上替代焦炭",
                "优化高炉布料制度",
                "使用高品位低杂质铁矿",
                "提高煤气利用率"
            ]
        }
    
    async def calculate_trt_benefit(self,
                                   trt_generation: float,
                                   grid_emission_factor: float = 0.5810) -> Dict[str, Any]:
        """
        计算TRT发电效益
        
        TRT：高炉煤气余压透平发电
        """
        # TRT发电碳减排
        carbon_reduction = trt_generation * grid_emission_factor  # tCO₂
        
        # 经济收益（按0.6元/kWh）
        economic_benefit = trt_generation * 0.6  # 万元
        
        return {
            "TRT发电量_kWh": trt_generation,
            "碳减排_tCO₂": round(carbon_reduction, 2),
            "经济效益_万元": round(economic_benefit, 2),
            "建议": "提高TRT发电量，减少外购电力，降低碳排放"
        }
    
    async def predict_hot_metal_quality(self, params: Dict[str, float]) -> Dict[str, Any]:
        """预测铁水质量"""
        silicon = params.get("[Si]", 0.5)
        sulfur = params.get("[S]", 0.02)
        temperature = params.get("铁水温度", 1500)
        
        quality_score = 100
        
        if silicon > 0.6:
            quality_score -= (silicon - 0.6) * 50
        if sulfur > 0.03:
            quality_score -= (sulfur - 0.03) * 1000
        if temperature < 1480:
            quality_score -= 10
        
        return {
            "预测硅含量": silicon,
            "预测硫含量": sulfur,
            "预测铁水温度": temperature,
            "质量评分": max(0, round(quality_score, 1)),
            "质量等级": "优" if quality_score >= 90 else "良" if quality_score >= 80 else "合格"
        }
    
    async def generate_optimization_suggestions(self,
                                                 current_params: Dict[str, float]) -> List[str]:
        """生成炼铁优化建议"""
        suggestions = []
        
        coke_ratio = current_params.get("入炉焦比", 411)
        if coke_ratio > 400:
            suggestions.append(f"当前入炉焦比{coke_ratio}kg/tFe，有优化空间：")
            suggestions.append("1. 提高喷煤比至150-180kg/tFe，煤粉替代部分焦炭")
            suggestions.append("2. 提高热风温度至1250℃以上")
            suggestions.append("3. 优化高炉布料，提高煤气利用率")
            suggestions.append("4. 使用高品位铁矿，降低渣量")
            suggestions.append("5. 加强炉前操作，减少铁损")
        
        trt_gen = current_params.get("TRT发电", 44)
        if trt_gen < 40:
            suggestions.append(f"TRT发电{trt_gen}kWh/t偏低，建议提高高炉顶压")
        
        return suggestions
```

### 4.5 炼钢Agent

```python
# ai-agent/app/agents/process/steelmaking_agent.py

"""
炼钢工序AI智能体

冷钢炼钢采用1#2#3#转炉(70t)，主要产品为粗钢。
碳排放特点：
- 有余能回收（转炉煤气回收），工序能耗为负
- 碳排放主要来自石灰石分解和电力消耗

关键工艺参数（2025年1月数据）：
- 粗钢产量：129,904.28 t/月
- 钢铁料消耗：1085.72 kg/t
- 转炉煤气回收：97.00 m³/t
- 冶金石灰消耗：28.79 kg/t
- 连铸比：100%
- 工序能耗：-16.12 kgce/t（余能回收）
"""

from typing import Dict, List, Any
from .base_process_agent import BaseProcessAgent, ProcessAgentConfig, ProcessType

class SteelMakingAgent(BaseProcessAgent):
    """
    炼钢AI智能体
    
    核心功能：
    1. 粗钢产量与碳排放核算
    2. 转炉煤气回收监控（关键减排点）
    3. 钢铁料消耗优化
    4. 石灰消耗控制
    5. 连铸比提升
    """
    
    EMISSION_FACTORS = {
        "limestone": 0.44,             # tCO₂/t 石灰石分解
        "converter_gas": 2.20,         # tCO₂/万m³ 转炉煤气
        "electricity": 0.5810,         # tCO₂/MWh
        "natural_gas": 2.16            # tCO₂/t 天然气
    }
    
    # 2025年实际参数
    ACTUAL_PARAMS_2025 = {
        "粗钢产量_1月": 129904.28,
        "钢铁料消耗": 1085.72,
        "转炉煤气回收": 97.00,
        "冶金石灰消耗": 28.79,
        "连铸比": 100.0
    }
    
    NORMAL_RANGES = {
        "钢铁料消耗": (1050, 1100),      # kg/t
        "转炉煤气回收": (85, 115),       # m³/t
        "石灰消耗": (25, 40),             # kg/t
        "出钢温度": (1640, 1680),         # ℃
        "吹炼时间": (12, 18),             # min
        "命中率": (90, 100),              # %
        "连铸比": (98, 100)               # %
    }
    
    def __init__(self):
        config = ProcessAgentConfig(
            name="炼钢碳排放Agent",
            process_type=ProcessType.STEELMAKING,
            description="炼钢工序碳排放监测与优化",
            key_parameters=[
                "粗钢产量",
                "钢铁料消耗",
                "转炉煤气回收",
                "石灰消耗",
                "连铸比"
            ],
            emission_sources=[
                "石灰石分解排放",
                "电力消耗隐含排放",
                "转炉煤气回收抵减"
            ],
            normal_ranges=self.NORMAL_RANGES
        )
        super().__init__(config)
    
    async def calculate_emission(self, activity_data: Dict[str, float]) -> Dict[str, float]:
        """
        炼钢碳排放计算
        
        公式：
        E_炼钢 = 石灰石×0.44 + 电力×0.5810 - 转炉煤气回收×2.20×0.8
        
        说明：
        - 石灰石分解是主要排放源
        - 转炉煤气回收按80%抵减
        
        Args:
            activity_data: {
                "粗钢产量": t,
                "石灰石/石灰消耗": t,
                "转炉煤气回收": 万m³,
                "电力消耗": MWh
            }
        """
        output = activity_data.get("粗钢产量", 0)  # t
        
        # 1. 石灰石分解排放
        limestone = activity_data.get("石灰石消耗", 0)  # t
        limestone_emission = limestone * self.EMISSION_FACTORS["limestone"]
        
        # 2. 电力隐含排放
        electricity = activity_data.get("电力消耗", 0)  # MWh
        power_emission = electricity * self.EMISSION_FACTORS["electricity"]
        
        # 3. 天然气排放
        natural_gas = activity_data.get("天然气消耗", 0)  # t
        gas_emission = natural_gas * self.EMISSION_FACTORS["natural_gas"]
        
        # 4. 转炉煤气回收抵减（回收利用率约80%）
        recovered_gas = activity_data.get("转炉煤气回收", 0)  # 万m³
        gas_credit = recovered_gas * self.EMISSION_FACTORS["converter_gas"] * 0.8
        
        total_emission = limestone_emission + power_emission + gas_emission - gas_credit
        
        # 关键指标
        steel_material_rate = activity_data.get("钢铁料消耗", 0)  # kg/t
        gas_recovery_rate = activity_data.get("转炉煤气回收", 0)  # m³/t
        
        return {
            "石灰石分解排放": round(limestone_emission, 2),
            "电力隐含排放": round(power_emission, 2),
            "天然气排放": round(gas_emission, 2),
            "转炉煤气回收抵减": round(-gas_credit, 2),
            "总排放量": round(total_emission, 2),
            "碳排放强度": round(total_emission / output, 4) if output > 0 else 0,
            "吨钢钢铁料_kg": round(steel_material_rate, 2),
            "转炉煤气回收_m³/t": round(gas_recovery_rate, 2),
            "单位": "tCO₂"
        }
    
    async def calculate_gas_recovery_optimization(self,
                                                   current_recovery: float,
                                                   target_recovery: float = 110) -> Dict[str, Any]:
        """
        计算转炉煤气回收优化潜力
        
        每提高1m³/t转炉煤气回收，吨钢减少约2.2kgCO₂排放
        """
        gap = target_recovery - current_recovery
        annual_production = 129904.28 * 12  # 年化产量
        
        # 碳减排计算
        annual_carbon_reduction = (gap / 1000) * annual_production * 2.2  # tCO₂
        
        return {
            "当前回收量": current_recovery,
            "目标回收量": target_recovery,
            "差距_m³/t": gap,
            "年化碳减排_tCO₂": round(annual_carbon_reduction, 0),
            "优化措施": [
                "优化转炉吹炼制度",
                "提高一次除尘效率",
                "采用煤气精细调节技术",
                "稳定铁水成分和温度"
            ]
        }
    
    async def calculate_steel_material_optimization(self,
                                                    current_rate: float) -> Dict[str, Any]:
        """计算钢铁料消耗优化潜力"""
        target_rate = 1050  # kg/t
        gap = current_rate - target_rate
        annual_production = 129904.28 * 12
        
        # 钢铁料节约量
        material_saving = (gap / 1000) * annual_production  # t
        
        # 成本节约（废钢价约3000元/t）
        cost_saving = material_saving * 0.3  # 万元
        
        return {
            "当前消耗": current_rate,
            "目标消耗": target_rate,
            "差距_kg/t": gap,
            "年化节约_t": round(material_saving, 0),
            "年化成本节约_万元": round(cost_saving, 0),
            "优化措施": [
                "提高铁水预处理脱硫效率",
                "减少转炉过吹",
                "优化废钢配比",
                "提高铁水温度"
            ]
        }
    
    async def generate_optimization_suggestions(self,
                                                 current_params: Dict[str, float]) -> List[str]:
        """生成炼钢优化建议"""
        suggestions = []
        
        gas_recovery = current_params.get("转炉煤气回收", 97)
        if gas_recovery < 100:
            suggestions.append(f"转炉煤气回收{gas_recovery}m³/t有提升空间：")
            suggestions.append("1. 优化吹炼制度，控制脱碳速度")
            suggestions.append("2. 提高煤气收集系统效率")
            suggestions.append("3. 采用煤气精调技术，提高回收率")
        
        steel_material = current_params.get("钢铁料消耗", 1085)
        if steel_material > 1070:
            suggestions.append(f"钢铁料消耗{steel_material}kg/t偏高，建议优化")
        
        return suggestions
```

### 4.6 轧钢Agent

```python
# ai-agent/app/agents/process/rolling_agent.py

"""
轧钢工序AI智能体

冷钢轧钢包括棒材和线材生产线，主要产品为热轧钢材。
碳排放主要来源：
1. 加热炉燃气消耗（天然气、高炉煤气等）
2. 电力消耗（轧机、除尘、冷却等）

关键工艺参数（2025年1月数据）：
- 钢材产量：122,970.03 t/月
- 热轧钢材合格率：99.95%
- 产品：棒材（550、610）、线材（450）
"""

from typing import Dict, List, Any
from .base_process_agent import BaseProcessAgent, ProcessAgentConfig, ProcessType

class RollingAgent(BaseProcessAgent):
    """
    轧钢AI智能体
    
    核心功能：
    1. 钢材产量与碳排放核算
    2. 燃气消耗优化
    3. 成材率提升
    4. 氧化烧损控制
    5. 余热回收利用
    """
    
    EMISSION_FACTORS = {
        "natural_gas": 2.16,             # tCO₂/t 天然气
        "mixed_gas": 1.57,               # tCO₂/t 混合煤气
        "electricity": 0.5810,           # tCO₂/MWh
        "heavy_oil": 3.06                # tCO₂/t 重油
    }
    
    NORMAL_RANGES = {
        "天然气单耗": (10, 15),             # m³/t
        "成材率": (97, 99),                 # %
        "氧化烧损": (0.8, 1.2),             # %
        "加热炉温度": (1100, 1250),          # ℃
        "热装比": (60, 90)                  # %
    }
    
    def __init__(self):
        config = ProcessAgentConfig(
            name="轧钢碳排放Agent",
            process_type=ProcessType.ROLLING,
            description="轧钢工序碳排放监测与优化",
            key_parameters=[
                "钢材产量",
                "天然气消耗",
                "电力消耗",
                "成材率"
            ],
            emission_sources=[
                "天然气燃烧排放",
                "混合煤气燃烧排放",
                "电力消耗隐含排放"
            ],
            normal_ranges=self.NORMAL_RANGES
        )
        super().__init__(config)
    
    async def calculate_emission(self, activity_data: Dict[str, float]) -> Dict[str, float]:
        """
        轧钢碳排放计算
        
        公式：
        E_轧钢 = 天然气×2.16 + 混合煤气×1.57 + 电力×0.5810
        
        Args:
            activity_data: {
                "钢材产量": t,
                "天然气消耗": m³,
                "混合煤气消耗": m³,
                "电力消耗": MWh
            }
        """
        output = activity_data.get("钢材产量", 0)  # t
        
        # 1. 天然气燃烧排放
        natural_gas = activity_data.get("天然气消耗", 0)  # m³
        gas_emission = (natural_gas / 1000) * self.EMISSION_FACTORS["natural_gas"]
        
        # 2. 混合煤气燃烧排放
        mixed_gas = activity_data.get("混合煤气消耗", 0)  # m³
        mixed_gas_emission = (mixed_gas / 10000) * self.EMISSION_FACTORS["mixed_gas"]
        
        # 3. 电力隐含排放
        electricity = activity_data.get("电力消耗", 0)  # MWh
        power_emission = electricity * self.EMISSION_FACTORS["electricity"]
        
        total_emission = gas_emission + mixed_gas_emission + power_emission
        
        # 关键指标
        gas_intensity = (natural_gas / output) if output > 0 else 0  # m³/t
        
        return {
            "天然气排放": round(gas_emission, 2),
            "混合煤气排放": round(mixed_gas_emission, 2),
            "电力隐含排放": round(power_emission, 2),
            "总排放量": round(total_emission, 2),
            "碳排放强度": round(total_emission / output, 4) if output > 0 else 0,
            "天然气单耗": round(gas_intensity, 2),
            "单位": "tCO₂"
        }
    
    async def calculate_product_rate_optimization(self,
                                                   current_rate: float) -> Dict[str, Any]:
        """计算成材率优化潜力"""
        target_rate = 98.5  # %
        gap = target_rate - current_rate
        annual_production = 122970 * 12
        
        # 金属损失减少
        material_saving = (gap / 100) * annual_production * current_rate / 100  # t
        
        return {
            "当前成材率": current_rate,
            "目标成材率": target_rate,
            "差距": gap,
            "年化金属节约_t": round(material_saving, 0),
            "优化措施": [
                "减少氧化烧损",
                "优化切损和头尾",
                "提高轧制精度",
                "减少轧废"
            ]
        }
    
    async def calculate_oxidation_loss(self,
                                       output: float,
                                       oxidation_rate: float = 1.0) -> Dict[str, Any]:
        """计算氧化烧损"""
        oxidation_loss = output * oxidation_rate / 100  # t
        
        # 氧化铁皮含碳约2%，氧化损失碳排放约0.02×3.04=0.06tCO₂/t
        carbon_loss = oxidation_loss * 0.06
        
        return {
            "氧化烧损率": oxidation_rate,
            "氧化烧损量_t": round(oxidation_loss, 2),
            "碳损失估算_tCO₂": round(carbon_loss, 2),
            "建议": "优化加热工艺，减少氧化烧损"
        }
    
    async def generate_optimization_suggestions(self,
                                                 current_params: Dict[str, float]) -> List[str]:
        """生成轧钢优化建议"""
        suggestions = []
        
        gas_intensity = current_params.get("天然气单耗", 15)
        if gas_intensity > 12:
            suggestions.append(f"天然气单耗{gas_intensity}m³/t偏高，建议：")
            suggestions.append("1. 提高热装比至80%以上")
            suggestions.append("2. 优化加热曲线，分段加热")
            suggestions.append("3. 加强炉体保温")
            suggestions.append("4. 回收余热用于预热")
        
        return suggestions
```

---

## 五、工序协同编排器

```python
# ai-agent/app/core/lengang_process_orchestrator.py

"""
冷钢5大工序协同编排器

负责：
1. 协调5大工序Agent执行碳排放核算
2. 汇总全流程碳排放数据
3. 识别跨工序优化机会
4. 生成综合优化建议
"""

from typing import Dict, List, Optional
from datetime import datetime
import asyncio

from ..agents.process.limestone_kiln_agent import LimestoneKilnAgent
from ..agents.process.sintering_agent import SinteringAgent
from ..agents.process.ironmaking_agent import IronMakingAgent
from ..agents.process.steelmaking_agent import SteelMakingAgent
from ..agents.process.rolling_agent import RollingAgent

class LengangProcessOrchestrator:
    """
    冷钢5大工序编排器
    
    工序顺序：
    石灰窑 → 烧结 → 炼铁 → 炼钢 → 轧钢
    
    注意事项：
    - 焦炭外购，不设焦化工序
    - 石灰窑（竖窑）作为独立工序
    """
    
    def __init__(self):
        # 初始化5大工序Agent
        self.agents = {
            "limestone_kiln": LimestoneKilnAgent(),    # 石灰窑（新增）
            "sintering": SinteringAgent(),
            "ironmaking": IronMakingAgent(),
            "steelmaking": SteelMakingAgent(),
            "rolling": RollingAgent()
        }
        
        # 工序顺序
        self.process_order = [
            "limestone_kiln",
            "sintering",
            "ironmaking",
            "steelmaking",
            "rolling"
        ]
        
        # 全流程数据
        self.process_chain_data = {
            "timestamp": None,
            "emissions": {},
            "total_emission": 0,
            "production_data": {}
        }
    
    async def calculate_full_chain_emission(self,
                                            process_data: Dict[str, Dict]) -> Dict:
        """
        计算全流程碳排放
        
        Args:
            process_data: 各工序活动水平数据
            
        Returns:
            全流程碳排放汇总
        """
        results = {}
        total = 0
        production = {}
        
        # 按顺序执行各工序计算
        tasks = []
        for process_type in self.process_order:
            if process_type in process_data:
                tasks.append(self._calculate_single_process(process_type, process_data[process_type]))
        
        process_results = await asyncio.gather(*tasks)
        
        for result in process_results:
            results[result["process"]] = result
            total += result["emission"]["总排放量"]
            production[result["process"]] = result["emission"].get("碳排放强度", 0)
        
        self.process_chain_data = {
            "timestamp": datetime.now(),
            "emissions": results,
            "total_emission": total,
            "production_data": production
        }
        
        # 计算排放分布
        distribution = {}
        for process, data in results.items():
            emission = data["emission"]["总排放量"]
            ratio = (emission / total * 100) if total > 0 else 0
            distribution[process] = {
                "排放量_tCO₂": round(emission, 2),
                "占比_%": round(ratio, 2)
            }
        
        return {
            "各工序排放": results,
            "全流程总排放_tCO₂": round(total, 2),
            "排放分布": distribution,
            "关键指标": production
        }
    
    async def _calculate_single_process(self, process_type: str, data: Dict) -> Dict:
        """计算单个工序排放"""
        agent = self.agents.get(process_type)
        if not agent:
            return {"process": process_type, "error": "Agent未找到"}
        
        emission = await agent.calculate_emission(data)
        alerts = await agent.monitor_parameters(data)
        
        # 工序中文名
        process_names = {
            "limestone_kiln": "石灰窑",
            "sintering": "烧结",
            "ironmaking": "炼铁",
            "steelmaking": "炼钢",
            "rolling": "轧钢"
        }
        
        return {
            "process": process_type,
            "process_name": process_names.get(process_type, process_type),
            "emission": emission,
            "alerts": alerts,
            "data": data
        }
    
    async def identify_optimization_opportunities(self) -> List[Dict]:
        """识别跨工序优化机会"""
        opportunities = []
        
        # 1. 煤气梯级利用（炼铁→炼钢→轧钢）
        if all(k in self.process_chain_data["emissions"] 
               for k in ["ironmaking", "steelmaking", "rolling"]):
            opportunities.append({
                "type": "gas_recycling",
                "processes": ["炼铁", "炼钢", "轧钢"],
                "description": "高炉煤气→转炉煤气→轧钢加热炉梯级利用",
                "benefit": "减少外部能源依赖，降低碳排放"
            })
        
        # 2. 余热回收
        opportunities.append({
            "type": "waste_heat",
            "processes": ["石灰窑", "轧钢"],
            "description": "竖窑余热+轧钢余热用于发电或预热",
            "benefit": "提高能源利用效率"
        })
        
        # 3. 重点工序优化（炼铁占比最高）
        if "ironmaking" in self.process_chain_data["emissions"]:
            iron_data = self.process_chain_data["emissions"]["ironmaking"]["emission"]
            if "碳排放强度" in iron_data:
                opportunities.append({
                    "type": "priority_optimization",
                    "processes": ["炼铁"],
                    "description": "炼铁碳排放占比最高，应重点优化焦比和喷煤比",
                    "target": "入炉焦比降至380kg/tFe以下",
                    "potential": "年化减排约10万吨CO₂"
                })
        
        return opportunities
    
    async def generate_monthly_report(self) -> Dict:
        """生成月度碳排放报告"""
        return {
            "report_type": "月度碳排放报告",
            "timestamp": datetime.now().isoformat(),
            "enterprise": "冷水江钢铁有限责任公司",
            "process_count": 5,
            "carbon_emission_summary": self.process_chain_data,
            "optimization_opportunities": await self.identify_optimization_opportunities(),
            "recommendations": self._generate_recommendations()
        }
    
    def _generate_recommendations(self) -> List[str]:
        """生成综合建议"""
        return [
            "1. 【重点】优化炼铁工序（碳排放占比~45%），降低入炉焦比",
            "2. 提高转炉煤气回收率至110m³/t以上",
            "3. 推进煤气梯级利用系统建设",
            "4. 提高余热余压回收利用率",
            "5. 建设能碳协同管控平台，实现精细化管理"
        ]
```

---

## 六、数据对接规范

### 6.1 工序数据源

| 工序 | 数据来源系统 | 主要数据项 | 接口方式 |
|------|-------------|-----------|----------|
| 石灰窑 | DCS/PLC | 产量、石灰石消耗、燃气消耗 | OPC UA |
| 烧结 | MES | 产量、燃料消耗、电力消耗 | API |
| 炼铁 | DCS | 产量、焦炭消耗、喷煤量、煤气产出 | OPC UA |
| 炼钢 | MES/L2 | 产量、煤气回收、石灰消耗 | API |
| 轧钢 | MES | 产量、燃气消耗、电力消耗 | API |

### 6.2 数据采集配置

```yaml
# config/process_data_sources.yaml

data_sources:
  limestone_kiln:
    system: "DCS_石灰窑"
    protocol: "OPC-UA"
    endpoint: "opc.tcp://localhost:4840"
    nodes:
      - name: "石灰产量"
        node_id: "ns=2;s=LimestoneKiln.Production"
      - name: "石灰石消耗"
        node_id: "ns=2;s=LimestoneKiln.LimestoneConsumption"
      - name: "高炉煤气消耗"
        node_id: "ns=2;s=LimestoneKiln.BFGasConsumption"
    
  sintering:
    system: "MES_烧结"
    protocol: "REST-API"
    endpoint: "http://mes-sintering:8080/api"
    auth: "bearer_token"
    
  ironmaking:
    system: "DCS_高炉"
    protocol: "OPC-UA"
    endpoint: "opc.tcp://localhost:4841"
    nodes:
      - name: "生铁产量"
        node_id: "ns=3;s=BlastFurnace.HotMetalOutput"
      - name: "焦炭消耗"
        node_id: "ns=3;s=BlastFurnace.CokeConsumption"
```

---

## 七、部署配置

### 7.1 Docker Compose 扩展

```yaml
# docker-compose.yml (新增工序Agent)

services:
  # ... 现有服务 ...
  
  limestone-kiln-agent:
    build: ./ai-agent
    command: python -m agents.process.limestone_kiln_agent
    environment:
      - AGENT_TYPE=limestone_kiln
      - REDIS_HOST=redis
    depends_on:
      - redis
      - carbon-service

  sintering-agent:
    build: ./ai-agent
    command: python -m agents.process.sintering_agent
    environment:
      - AGENT_TYPE=sintering
      - REDIS_HOST=redis
    depends_on:
      - redis
      - carbon-service

  ironmaking-agent:
    build: ./ai-agent
    command: python -m agents.process.ironmaking_agent
    environment:
      - AGENT_TYPE=ironmaking
      - REDIS_HOST=redis
    depends_on:
      - redis
      - carbon-service

  steelmaking-agent:
    build: ./ai-agent
    command: python -m agents.process.steelmaking_agent
    environment:
      - AGENT_TYPE=steelmaking
      - REDIS_HOST=redis
    depends_on:
      - redis
      - carbon-service

  rolling-agent:
    build: ./ai-agent
    command: python -m agents.process.rolling_agent
    environment:
      - AGENT_TYPE=rolling
      - REDIS_HOST=redis
    depends_on:
      - redis
      - carbon-service
```

---

## 八、技术基座完善建议

### 8.1 TAIJI Agent能力评估

| 功能 | TAIJI Agent | Hermes Agent | OpenClaw | 建议 |
|------|-------------|--------------|----------|------|
| 生态环境领域 | ✅ 垂直 | ⚠️ 通用 | ⚠️ 通用 | 参考借鉴 |
| 碳排放核算 | ✅ 支持 | ⚠️ 需训练 | ⚠️ 需配置 | 完善 |
| 自进化能力 | ⚠️ 部分 | ✅ 内置 | ❌ 需扩展 | **补充Hermes** |
| 长期记忆 | ⚠️ 简单 | ✅ 四层 | ⚠️ 简单 | **补充Hermes** |
| 多Agent协作 | ⚠️ 基础 | ⚠️ 基础 | ✅ A2A协议 | **补充OpenClaw** |
| 工序专业性 | ❌ 缺失 | ❌ 缺失 | ❌ 缺失 | **需自主开发** |

### 8.2 推荐技术架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    推荐技术架构                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              Hermes Agent (核心调度 + 自进化 + 长期记忆)              │    │
│  │  来源：nousresearch/hermes-agent                                     │    │
│  │  能力：四层内存、闭环学习、技能生成                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              OpenClaw Agent Gateway (多Agent协作)                    │    │
│  │  来源：openclaw/openclaw                                             │    │
│  │  能力：A2A协议、工作区隔离、权限控制                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              5大工序专业Agent (自主开发)                              │    │
│  │  • 石灰窑Agent   • 烧结Agent   • 炼铁Agent                           │    │
│  │  • 炼钢Agent    • 轧钢Agent                                        │    │
│  │  特点：内置冷钢工艺知识、碳核算算法、冶金参数                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              TAIJI Agent (参考借鉴)                                  │    │
│  │  来源：xiejianjun000/taiji-agent                                     │    │
│  │  参考：生态环境领域经验、碳排放模型设计                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 实施步骤

| 阶段 | 内容 | 技术选型 | 时间 |
|------|------|----------|------|
| **Phase 1** | 基础框架搭建 | Hermes + OpenClaw | 1-2月 |
| **Phase 2** | 工序Agent开发 | 自主开发（基于本文档） | 3-4月 |
| **Phase 3** | 数据对接 | MES/DCS/API | 5-6月 |
| **Phase 4** | 知识库建设 | TAIJI参考 + 自主构建 | 7-8月 |
| **Phase 5** | 自进化启用 | Hermes自进化机制 | 9-12月 |

---

**文档编制**：齐活林（Qi）  
**日期**：2026年5月12日  
**版本**：v2.0（修正版）
