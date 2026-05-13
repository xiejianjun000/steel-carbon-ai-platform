import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { getMonitorDashboard } from '../../services/monitor';
import { formatNumber } from '../../utils/format';

/**
 * 碳监测大屏 - 实时碳排放数据可视化
 */
export default function DashboardScreen() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // 模拟大屏数据
    setData({
      yearlyTotal: 1234567.89,
      yearlyTarget: 3711981.00,
      monthlyEmission: 309331.75,
      intensity: 1.97,
      emissionStructure: { fuel: 274002, process: 19175, electricity: 16155 },
      processRanking: [
        { name: '烧结', emission: 82500 },
        { name: '炼铁', emission: 165000 },
        { name: '炼钢', emission: 42000 },
        { name: '焦化', emission: 15832 },
        { name: '轧钢', emission: 4000 },
      ],
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        value: 10000 + Math.random() * 5000,
      })),
      recentAlerts: [
        { level: 'YELLOW', title: '高炉煤气排放偏高', time: '10:30' },
        { level: 'RED', title: '烧结工序日排放超标', time: '09:15' },
        { level: 'BLUE', title: '轧钢工序电力消耗增长', time: '08:45' },
      ],
    });
  }, []);

  if (!data) return <Typography>加载中...</Typography>;

  const completionRate = ((data.yearlyTotal / data.yearlyTarget) * 100).toFixed(1);

  // 年度进度仪表盘
  const gaugeOption = {
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      progress: { show: true, width: 20 },
      pointer: { show: false },
      axisLine: { lineStyle: { width: 20, color: [[1, '#e0e0e0']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      title: { fontSize: 14, offsetCenter: [0, '60%'] },
      detail: {
        fontSize: 28,
        fontWeight: 'bold',
        offsetCenter: [0, '20%'],
        formatter: '{value}%',
      },
      data: [{ value: parseFloat(completionRate), name: '年度配额使用率' }],
    }],
  };

  // 小时排放曲线
  const hourlyOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: data.hourlyData.map((d: any) => d.hour) },
    yAxis: { type: 'value', name: 'tCO\u2082/h' },
    series: [{
      type: 'line',
      data: data.hourlyData.map((d: any) => d.value.toFixed(1)),
      smooth: true,
      areaStyle: { color: 'rgba(21,101,192,0.1)' },
      lineStyle: { color: '#1565c0', width: 2 },
    }],
  };

  // 工序排放柱状图
  const processOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: data.processRanking.map((p: any) => p.name) },
    yAxis: { type: 'value', name: 'tCO\u2082' },
    series: [{
      type: 'bar',
      data: data.processRanking.map((p: any) => p.emission),
      itemStyle: {
        color: (params: any) => {
          const colors = ['#ef5350', '#ff7043', '#ffa726', '#42a5f5', '#66bb6a'];
          return colors[params.dataIndex % colors.length];
        },
      },
    }],
  };

  return (
    <Box sx={{
      bgcolor: '#1a237e',
      color: '#fff',
      p: 3,
      minHeight: '100%',
      borderRadius: 2,
    }}>
      {/* 标题 */}
      <Typography variant="h4" fontWeight="bold" textAlign="center" sx={{ mb: 3 }}>
        冷钢碳排放实时监测大屏
      </Typography>

      {/* 核心指标 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
        {[
          { label: '年度累计排放', value: `${formatNumber(data.yearlyTotal)} tCO\u2082`, sub: `目标 ${formatNumber(data.yearlyTarget)}` },
          { label: '本月排放', value: `${formatNumber(data.monthlyEmission)} tCO\u2082`, sub: 'tCO\u2082' },
          { label: '碳排放强度', value: `${data.intensity} tCO\u2082/t钢`, sub: '吨钢碳排放' },
          { label: '活跃预警', value: `${data.recentAlerts.length} 条`, sub: '待处理' },
        ].map((item, i) => (
          <Box key={i} sx={{
            bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 1, p: 2,
            borderLeft: '3px solid #42a5f5',
          }}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>{item.label}</Typography>
            <Typography variant="h5" fontWeight="bold">{item.value}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>{item.sub}</Typography>
          </Box>
        ))}
      </Box>

      {/* 图表区域 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>年度配额进度</Typography>
          <ReactECharts option={gaugeOption} style={{ height: 220 }} />
        </Box>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>今日小时排放曲线</Typography>
          <ReactECharts option={hourlyOption} style={{ height: 220 }} />
        </Box>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>工序排放对比</Typography>
          <ReactECharts option={processOption} style={{ height: 220 }} />
        </Box>
      </Box>
    </Box>
  );
}
