"""
碳核算Agent - 基于冷钢真实数据自动执行碳排放核算
"""
from typing import Any, Dict, List, Optional
import os
import pandas as pd
from app.agents.base_agent import BaseAgent, AgentRole, AgentContext, ToolResult

# CO₂与C的分子量之比
CO2_C_RATIO = 44 / 12

# 数据文件路径配置（基于冷钢2025年实际数据）
DATA_DIR = r"E:\冷钢碳排放基础资料"

# 排放因子数据库（来源：GB/T 32150-2025《工业企业温室气体排放核算和报告通则》+ GB/T 32151.5-2026《温室气体排放核算与报告要求 第5部分：钢铁生产企业》）
EMISSION_FACTORS = {
    # 化石燃料燃烧排放因子（来源：GB/T 32150-2025 附录B）
    "FUEL_COKE":       {"name": "焦炭",       "ncv": 28.435,  "cc": 94.0, "of": 0.988},
    "FUEL_ANTHRACITE": {"name": "无烟煤",     "ncv": 20.908,  "cc": 93.6, "of": 0.940},
    "FUEL_BITUMINOUS": {"name": "烟煤",       "ncv": 20.908,  "cc": 80.7, "of": 0.981},
    "FUEL_NATGAS":     {"name": "天然气",     "ncv": 389.31,  "cc": 15.3, "of": 0.995},
    "FUEL_COKING_GAS": {"name": "焦炉煤气",   "ncv": 179.21,  "cc": 12.1, "of": 0.995},
    "FUEL_BLAST_GAS":  {"name": "高炉煤气",   "ncv": 33.12,   "cc": 70.8, "of": 0.995},
    "FUEL_CONVERTER_GAS": {"name": "转炉煤气", "ncv": 75.14,   "cc": 12.1, "of": 0.995},
    # 过程排放因子（来源：GB/T 32150-2025 附录B）
    "PROC_LIMESTONE":  {"name": "石灰石分解", "ef": 0.4397},
    "PROC_DOLOMITE":   {"name": "白云石分解", "ef": 0.4743},
    # 电力排放因子（来源：生态环境部2024年12月发布，2022年度数据）
    "ELEC_CENTRAL":    {"name": "华中电网(湖南)", "ef": 0.5810, "year": "2022年数据(2024年发布)"},
}

# 5大工序（冷钢实际工序结构，焦化外购）
PROCEDURES = [
    {"id": 1, "name": "石灰窑", "code": "LIMESTONE_KILN", "product": "石灰"},
    {"id": 2, "name": "烧结",   "code": "SINTERING",      "product": "烧结矿"},
    {"id": 3, "name": "炼铁",   "code": "IRONMAKING",     "product": "生铁"},
    {"id": 4, "name": "炼钢",   "code": "STEELMAKING",    "product": "粗钢"},
    {"id": 5, "name": "轧钢",   "code": "ROLLING",        "product": "钢材"},
]


class RealDataLoader:
    """冷钢真实数据加载器 - 从Excel文件读取2025年实际数据"""

    def __init__(self, data_dir: str = DATA_DIR):
        self.data_dir = data_dir
        self._cache: Dict[str, pd.DataFrame] = {}

    def _load_excel(self, month: int) -> Optional[pd.DataFrame]:
        """加载指定月份的Excel数据"""
        if month < 1 or month > 12:
            return None
        cache_key = f"month_{month}"

        if cache_key not in self._cache:
            file_path = os.path.join(self.data_dir, "2025年钢协经济技术指标(碳排放1.12）.xls")
            if not os.path.exists(file_path):
                return None
            try:
                self._cache[cache_key] = pd.read_excel(file_path, sheet_name=f"{month:02d}", header=None)
            except Exception as e:
                return None

        return self._cache[cache_key]

    def get_production_summary(self, month: int) -> Dict[str, Any]:
        """获取产量汇总数据"""
        df = self._load_excel(month)
        if df is None:
            return {"error": "数据文件不存在"}

        summary = {"month": month, "year": 2025, "products": {}}

        # 石灰窑产量 (行5)
        if len(df) > 5:
            val = df.iloc[5][2]  # 煅烧产品合格率行 -> 产量
            if pd.notna(val):
                summary["products"]["石灰窑"] = {"产量_t": val}

        # 烧结矿产量 (行17 母项)
        if len(df) > 17:
            val = df.iloc[17][3]  # 烧结矿合格率 -> 母项=产量
            if pd.notna(val):
                summary["products"]["烧结"] = {"产量_t": val}

        # 炼铁产量 (行105 子项 = 生铁产量)
        if len(df) > 105:
            val = df.iloc[105][2]
            if pd.notna(val):
                summary["products"]["炼铁"] = {"产量_t": val}

        # 炼钢产量 (需查找)
        for i in range(330, 360):
            if len(df) > i:
                val = df.iloc[i][0]
                if pd.notna(val) and "粗钢综合合格率" in str(val):
                    steel_prod = df.iloc[i][2]
                    if pd.notna(steel_prod):
                        summary["products"]["炼钢"] = {"产量_t": steel_prod}
                    break

        # 轧钢产量 (查找热轧钢材)
        for i in range(556, 600):
            if len(df) > i:
                val = df.iloc[i][0]
                if pd.notna(val) and "热轧钢材合格率" in str(val):
                    rolling_prod = df.iloc[i][3]  # 母项=产量
                    if pd.notna(rolling_prod):
                        summary["products"]["轧钢"] = {"产量_t": rolling_prod}
                    break

        return summary

    def get_emission_activity_data(self, month: int) -> List[Dict]:
        """获取碳排放核算所需的活动数据（基于冷钢2025年真实数据）"""
        df = self._load_excel(month)
        if df is None:
            return []

        activity_items = []

        # ============ 1. 石灰窑活动数据 ============
        # 电力消耗 (行8 子项)
        if len(df) > 8:
            power_kwh = df.iloc[8][2]  # 电力 子项 = 总消耗 kWh
            if pd.notna(power_kwh):
                activity_items.append({
                    "code": "ELEC_CENTRAL",
                    "process": 1,
                    "consumption": power_kwh / 1000,  # kWh -> MWh
                    "unit": "MWh",
                    "type": "ELECTRICITY",
                    "description": f"石灰窑电力消耗 {power_kwh/7738.84:.2f} kWh/t (总计 {power_kwh:.0f} kWh)"
                })

        # 高炉煤气消耗 (行9 子项)
        if len(df) > 9:
            gas_kg = df.iloc[9][2]  # 高炉煤气 子项 = 总消耗 kg
            if pd.notna(gas_kg):
                activity_items.append({
                    "code": "FUEL_BLAST_GAS",
                    "process": 1,
                    "consumption": gas_kg / 1000,  # kg -> t
                    "unit": "t",
                    "type": "FUEL",
                    "description": f"石灰窑高炉煤气消耗 {gas_kg/7738.84:.2f} kg/t (总计 {gas_kg/1000:.2f} t)"
                })

        # ============ 2. 烧结活动数据 ============
        # 烧结矿产量 (行17 母项)
        sintering_prod = 0
        if len(df) > 17:
            sintering_prod = df.iloc[17][3]
            if pd.notna(sintering_prod):
                sintering_prod = float(sintering_prod)

        # 石灰石消耗 (行39 指标 * 产量)
        if len(df) > 39 and sintering_prod > 0:
            limestone_rate = df.iloc[39][4]  # kg/t
            if pd.notna(limestone_rate):
                limestone_t = sintering_prod * limestone_rate / 1000
                activity_items.append({
                    "code": "PROC_LIMESTONE",
                    "process": 2,
                    "consumption": limestone_t,
                    "unit": "t",
                    "type": "PROCESS",
                    "description": f"烧结石灰石消耗 {limestone_rate:.2f} kg/t (总计 {limestone_t:.2f} t)"
                })

        # 白云石消耗 (行41 指标 * 产量)
        if len(df) > 41 and sintering_prod > 0:
            dolomite_rate = df.iloc[41][4]
            if pd.notna(dolomite_rate):
                dolomite_t = sintering_prod * dolomite_rate / 1000
                activity_items.append({
                    "code": "PROC_DOLOMITE",
                    "process": 2,
                    "consumption": dolomite_t,
                    "unit": "t",
                    "type": "PROCESS",
                    "description": f"烧结白云石消耗 {dolomite_rate:.2f} kg/t (总计 {dolomite_t:.2f} t)"
                })

        # 焦粉消耗 (行47 指标 * 产量)
        if len(df) > 47 and sintering_prod > 0:
            coke_rate = df.iloc[47][4]
            if pd.notna(coke_rate):
                coke_t = sintering_prod * coke_rate / 1000
                activity_items.append({
                    "code": "FUEL_BITUMINOUS",
                    "process": 2,
                    "consumption": coke_t,
                    "unit": "t",
                    "type": "FUEL",
                    "description": f"烧结焦粉消耗 {coke_rate:.2f} kg/t (总计 {coke_t:.2f} t)"
                })

        # 烧结电力消耗 (行52 母项 * 指标)
        if len(df) > 52 and sintering_prod > 0:
            sinter_power_rate = df.iloc[52][4]  # kWh/t
            if pd.notna(sinter_power_rate):
                sinter_power_mwh = sintering_prod * sinter_power_rate / 1000
                activity_items.append({
                    "code": "ELEC_CENTRAL",
                    "process": 2,
                    "consumption": sinter_power_mwh,
                    "unit": "MWh",
                    "type": "ELECTRICITY",
                    "description": f"烧结电力消耗 {sinter_power_rate:.2f} kWh/t (总计 {sinter_power_mwh:.2f} MWh)"
                })

        # ============ 3. 炼铁活动数据 ============
        # 焦炭消耗 (行161 母项 = 焦炭总量 kg)
        if len(df) > 161:
            coke_kg = df.iloc[161][2]
            if pd.notna(coke_kg):
                coke_t = float(coke_kg) / 1000  # kg -> t
                activity_items.append({
                    "code": "FUEL_COKE",
                    "process": 3,
                    "consumption": coke_t,
                    "unit": "t",
                    "type": "FUEL",
                    "description": f"炼铁焦炭消耗 {df.iloc[161][4]:.2f} kg/t (总计 {coke_t:.2f} t)"
                })

        # 炼铁电力消耗 (行205 指标 * 产量)
        pig_iron_prod = 0
        if len(df) > 105:
            pig_iron_prod = df.iloc[105][2]
            if pd.notna(pig_iron_prod):
                pig_iron_prod = float(pig_iron_prod)

        if len(df) > 205 and pig_iron_prod > 0:
            iron_power_rate = df.iloc[205][4]  # kWh/t
            if pd.notna(iron_power_rate):
                iron_power_mwh = pig_iron_prod * iron_power_rate / 1000
                activity_items.append({
                    "code": "ELEC_CENTRAL",
                    "process": 3,
                    "consumption": iron_power_mwh,
                    "unit": "MWh",
                    "type": "ELECTRICITY",
                    "description": f"炼铁电力消耗 {iron_power_rate:.2f} kWh/t (总计 {iron_power_mwh:.2f} MWh)"
                })

        # ============ 4. 炼钢活动数据 ============
        # 查找炼钢电力消耗
        steel_prod = 0
        for i in range(330, 360):
            if len(df) > i:
                val = df.iloc[i][0]
                if pd.notna(val) and "粗钢综合合格率" in str(val):
                    steel_prod = df.iloc[i][2]
                    if pd.notna(steel_prod):
                        steel_prod = float(steel_prod)
                    break

        for i in range(343, 400):
            if len(df) > i:
                val = df.iloc[i][0]
                if pd.notna(val) and val.strip() == "电力消耗" and "kwh/t" in str(df.iloc[i][1]):
                    steel_power_rate = df.iloc[i][4]
                    if pd.notna(steel_power_rate) and steel_prod > 0:
                        steel_power_mwh = steel_prod * steel_power_rate / 1000
                        activity_items.append({
                            "code": "ELEC_CENTRAL",
                            "process": 4,
                            "consumption": steel_power_mwh,
                            "unit": "MWh",
                            "type": "ELECTRICITY",
                            "description": f"炼钢电力消耗 {steel_power_rate:.2f} kWh/t (总计 {steel_power_mwh:.2f} MWh)"
                        })
                    break

        # ============ 5. 轧钢活动数据 ============
        # 查找轧钢电力消耗
        rolling_prod = 0
        for i in range(556, 580):
            if len(df) > i:
                val = df.iloc[i][0]
                if pd.notna(val) and "热轧钢材合格率" in str(val):
                    rolling_prod = df.iloc[i][3]
                    if pd.notna(rolling_prod):
                        rolling_prod = float(rolling_prod)
                    break

        for i in range(540, 560):
            if len(df) > i:
                val = df.iloc[i][0]
                if pd.notna(val) and val.strip() == "电力消耗" and "kwh/t" in str(df.iloc[i][1]):
                    rolling_power_rate = df.iloc[i][4]
                    if pd.notna(rolling_power_rate) and rolling_prod > 0:
                        rolling_power_mwh = rolling_prod * rolling_power_rate / 1000
                        activity_items.append({
                            "code": "ELEC_CENTRAL",
                            "process": 5,
                            "consumption": rolling_power_mwh,
                            "unit": "MWh",
                            "type": "ELECTRICITY",
                            "description": f"轧钢电力消耗 {rolling_power_rate:.2f} kWh/t (总计 {rolling_power_mwh:.2f} MWh)"
                        })
                    break

        return activity_items


# 全局数据加载器
_data_loader = RealDataLoader()


def calculate_fuel_emission(fuel_code: str, consumption: float) -> Dict:
    """计算化石燃料燃烧排放: E = AD × NCV × CC × OF × 44/12"""
    factor = EMISSION_FACTORS.get(fuel_code)
    if not factor:
        raise ValueError(f"未知的燃料类型: {fuel_code}")

    ncv = factor["ncv"] / 10000  # TJ/万吨 -> TJ/t
    cc = factor["cc"]
    of_ = factor["of"]
    emission = consumption * ncv * cc * of_ * CO2_C_RATIO

    return {
        "fuel_code": fuel_code,
        "fuel_name": factor["name"],
        "consumption_t": consumption,
        "ncv_tj_per_t": ncv,
        "cc_tc_per_tj": cc,
        "oxidation_rate": of_,
        "emission_tco2": round(emission, 4),
    }


def calculate_process_emission(proc_code: str, consumption: float) -> Dict:
    """计算过程排放: E = AD × EF"""
    factor = EMISSION_FACTORS.get(proc_code)
    if not factor or "ef" not in factor:
        raise ValueError(f"未知的过程排放源: {proc_code}")

    emission = consumption * factor["ef"]
    return {
        "process_code": proc_code,
        "name": factor["name"],
        "consumption_t": consumption,
        "emission_factor": factor["ef"],
        "emission_tco2": round(emission, 4),
    }


def calculate_electricity_emission(grid_code: str, power_mwh: float) -> Dict:
    """计算净购入电力排放: E = AD(MWh) × EF(tCO2/MWh)"""
    factor = EMISSION_FACTORS.get(grid_code)
    if not factor or "ef" not in factor:
        raise ValueError(f"未知的电网: {grid_code}")

    emission = power_mwh * factor["ef"]

    return {
        "grid_code": grid_code,
        "grid_name": factor["name"],
        "power_mwh": power_mwh,
        "grid_factor": factor["ef"],
        "year": factor.get("year", "N/A"),
        "emission_tco2": round(emission, 4),
    }


class CarbonAccountingAgent(BaseAgent):
    """碳核算Agent - 依据GB/T 32150-2025及GB/T 32151.5-2026执行碳排放核算"""

    def __init__(self):
        super().__init__(
            name="碳核算Agent",
            role=AgentRole.CARBON_ACCOUNTING,
            description="基于冷钢真实数据自动执行碳排放核算计算"
        )
        # 注册工具
        self.register_tool("calculate_fuel_emission", calculate_fuel_emission)
        self.register_tool("calculate_process_emission", calculate_process_emission)
        self.register_tool("calculate_electricity_emission", calculate_electricity_emission)

    def get_system_prompt(self) -> str:
        return """你是一个专业的碳排放核算智能体。你需要根据提供的活动数据和排放因子，按照最新国家标准计算碳排放量。

**适用标准（最新版）**：
1. GB/T 32150-2025 温室气体排放核算通则（2025.12.31发布，2026.7.1实施）
2. GB/T 32151.5-2026 钢铁行业碳排放核算要求（2026.3.31发布）
3. 生态环境部2022年度电网排放因子（2024.12发布）：华中电网0.5810 tCO2/MWh

**计算规则**：
1. 化石燃料燃烧排放：E = AD × NCV × CC × OF × 44/12
2. 过程排放：E = AD × EF
3. 净购入电力排放：E = AD_电力 × EF_电网

**冷钢5大工序**：
1. 石灰窑（辅助原料煅烧）
2. 烧结
3. 炼铁
4. 炼钢
5. 轧钢

**重要说明**：
- 钢铁行业自2025年3月起正式纳入全国碳排放权交易市场
- 本系统使用冷钢2025年真实生产数据（非模拟数据）

请按步骤执行计算，每步记录中间结果，确保计算过程可追溯。"""

    async def execute(self, context: AgentContext) -> Dict[str, Any]:
        """执行碳核算（基于真实数据）"""
        period_month = context.params.get("period_month")
        process_ids = context.params.get("process_ids", [1, 2, 3, 4, 5])

        if not period_month:
            return {"success": False, "error": "请指定核算月份，格式：YYYY-MM 或 YYYYMM"}

        # 解析月份
        if isinstance(period_month, str):
            month_str = period_month.replace("-", "").replace("/", "")
            if len(month_str) == 6:
                month = int(month_str[4:6])
            elif len(month_str) == 8:
                month = int(month_str[6:8])
            else:
                return {"success": False, "error": "月份格式错误"}
        else:
            month = period_month

        self.logger.info(f"开始碳核算: 2025年{month}月, 工序: {process_ids}")

        # 从真实数据文件加载活动数据
        activity_items = _data_loader.get_emission_activity_data(month)

        if not activity_items:
            return {
                "success": False,
                "error": f"未找到2025年{month}月的真实数据，请确认数据文件存在",
                "data_source": os.path.join(DATA_DIR, "2025年钢协经济技术指标(碳排放1.12）.xls")
            }

        # 按工序筛选
        if process_ids and process_ids != [1, 2, 3, 4, 5]:
            activity_items = [item for item in activity_items if item["process"] in process_ids]

        fuel_total = 0
        process_total = 0
        electricity_total = 0
        details = []

        for item in activity_items:
            try:
                if item["type"] == "FUEL":
                    result = calculate_fuel_emission(item["code"], item["consumption"])
                    fuel_total += result["emission_tco2"]
                elif item["type"] == "PROCESS":
                    result = calculate_process_emission(item["code"], item["consumption"])
                    process_total += result["emission_tco2"]
                elif item["type"] == "ELECTRICITY":
                    result = calculate_electricity_emission(item["code"], item["consumption"])
                    electricity_total += result["emission_tco2"]

                details.append({**result, **item})
            except Exception as e:
                details.append({"error": str(e), **item})

        total = fuel_total + process_total + electricity_total

        return {
            "success": True,
            "data": {
                "period_month": f"2025-{month:02d}",
                "total_emission": round(total, 2),
                "unit": "tCO2",
                "breakdown": {
                    "fuel_combustion": round(fuel_total, 2),
                    "process_emission": round(process_total, 2),
                    "electricity": round(electricity_total, 2),
                },
                "procedures": [p for p in PROCEDURES if p["id"] in (process_ids or [1,2,3,4,5])],
                "data_source": "冷钢2025年钢协经济技术指标(碳排放1.12）.xls",
                "standards_applied": [
                    "GB/T 32150-2025 温室气体排放核算通则（2025.12.31发布）",
                    "GB/T 32151.5-2026 钢铁行业碳排放核算要求（2026.3.31发布）",
                    "生态环境部2022年度电网排放因子（2024.12发布）"
                ],
                "details": details,
                "calculation_id": f"calc_2025{month:02d}_real_001",
            }
        }
