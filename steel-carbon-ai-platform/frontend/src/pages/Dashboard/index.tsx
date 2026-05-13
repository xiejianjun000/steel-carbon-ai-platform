import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Skeleton,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SpeedIcon from '@mui/icons-material/Speed';
import FactoryIcon from '@mui/icons-material/Factory';
import BoltIcon from '@mui/icons-material/Bolt';
import ReactECharts from 'echarts-for-react';
import { getMonitorDashboard } from '../../services/monitor';
import { formatNumber } from '../../utils/format';

/**
 * 碳排放概览仪表盘
 */
export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res: any = await getMonitorDashboard();
      if (res.code === 200) setData(res.data);
    } catch {
      // 开发模式使用模拟数据
      setData({
        yearlyTotal: 1234567.89,
        yearlyTarget: 3711981.00,
        monthlyEmission: 309331.75,
        lastMonthEmission: 315000.00,
        intensity: 1.97,
        emissionStructure: { fuel: 274002.33, process: 19174.50, electricity: 16154.92 },
        processRanking: [
          { processId: 2, name: '炼铁', emission: 165000 },
          { processId: 1, name: '烧结', emission: 82500 },
          { processId: 3, name: '炼钢', emission: 42000 },
          { processId: 5, name: '焦化', emission: 15832 },
          { processId: 4, name: '轧钢', emission: 4000 },
        ],
        recentAlerts: [
          { id: 1, level: 'YELLOW', title: '高炉煤气排放偏高', status: 'PENDING' },
          { id: 2, level: 'RED', title: '烧结工序月排放超标', status: 'PENDING' },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="rounded" height={120} />
          </Grid>
        ))}
        <Grid item xs={12} md={8}><Skeleton variant="rounded" height={350} /></Grid>
        <Grid item xs={12} md={4}><Skeleton variant="rounded" height={350} /></Grid>
      </Grid>
    );
  }

  // 统计卡片数据
  const stats = [
    {
      label: '本年度累计排放',
      value: `${formatNumber(data.yearlyTotal)} tCO\u2082`,
      sub: `目标 ${formatNumber(data.yearlyTarget)} tCO\u2082`,
      color: '#1565c0',
      icon: <SpeedIcon />,
    },
    {
      label: '本月排放量',
      value: `${formatNumber(data.monthlyEmission)} tCO\u2082`,
      sub: `上月 ${formatNumber(data.lastMonthEmission)}`,
      change: ((data.monthlyEmission - data.lastMonthEmission) / data.lastMonthEmission * 100).toFixed(1),
      color: data.monthlyEmission <= data.lastMonthEmission ? '#2e7d32' : '#c62828',
      icon: data.monthlyEmission <= data.lastMonthEmission ? <TrendingDownIcon /> : <TrendingUpIcon />,
    },
    {
      label: '碳排放强度',
      value: `${data.intensity} tCO\u2082/t钢`,
      sub: '吨钢碳排放',
      color: '#7b1fa2',
      icon: <FactoryIcon />,
    },
    {
      label: '待处理预警',
      value: data.recentAlerts?.length || 0,
      sub: '需要关注',
      color: '#e65100',
      icon: <WarningAmberIcon />,
    },
  ];

  // 月度趋势图配置
  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['燃料排放', '过程排放', '电力排放', '总排放'] },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    },
    yAxis: { type: 'value', name: 'tCO\u2082' },
    series: [
      { name: '燃料排放', type: 'bar', stack: 'total', data: [274002, 268000, 272000, 270000, 266000, 264000, 270000, 272000, 268000, 265000, 270000, 0], itemStyle: { color: '#ef5350' } },
      { name: '过程排放', type: 'bar', stack: 'total', data: [19174, 18800, 19200, 19000, 18900, 18700, 19100, 19200, 18800, 18900, 19100, 0], itemStyle: { color: '#ff9800' } },
      { name: '电力排放', type: 'bar', stack: 'total', data: [16155, 15800, 16200, 16000, 15900, 15700, 16100, 16200, 15800, 15900, 16100, 0], itemStyle: { color: '#42a5f5' } },
    ],
  };

  // 工序排放饼图配置
  const pieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} tCO\u2082 ({d}%)' },
    legend: { orient: 'vertical', left: 10, top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      data: data.processRanking.map((p: any) => ({ name: p.name, value: p.emission })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } },
    }],
  };

  return (
    <Box>
      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card className="card-hover" sx={{ borderLeft: `4px solid ${stat.color}` }}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.label}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    {stat.sub && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {stat.sub}
                      </Typography>
                    )}
                    {stat.change !== undefined && (
                      <Chip
                        size="small"
                        label={`${Number(stat.change) > 0 ? '+' : ''}${stat.change}%`}
                        color={Number(stat.change) > 0 ? 'error' : 'success'}
                        sx={{ ml: 1, height: 20, fontSize: 12 }}
                      />
                    )}
                  </Box>
                  <Box sx={{ color: stat.color, opacity: 0.7 }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 图表区 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>月度碳排放趋势</Typography>
              <ReactECharts option={trendOption} style={{ height: 320 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>工序排放占比</Typography>
              <ReactECharts option={pieOption} style={{ height: 320 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 工序排行 */}
      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>工序排放排名</Typography>
              {data.processRanking.map((p: any, i: number) => (
                <Box
                  key={p.processId}
                  sx={{
                    display: 'flex', alignItems: 'center', py: 1,
                    borderBottom: i < data.processRanking.length - 1 ? '1px solid #f0f0f0' : 'none',
                  }}
                >
                  <Typography variant="body2" sx={{ width: 24, color: i < 3 ? '#d32f2f' : 'text.secondary', fontWeight: i < 3 ? 'bold' : 'normal' }}>
                    {i + 1}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>{p.name}</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatNumber(p.emission)} tCO\u2082
                  </Typography>
                  <BoltIcon sx={{ ml: 1, color: '#ff9800', fontSize: 16 }} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* 最新预警 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>最新预警</Typography>
              {data.recentAlerts?.map((alert: any) => (
                <Box
                  key={alert.id}
                  sx={{
                    display: 'flex', alignItems: 'center', py: 1,
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <Chip
                    size="small"
                    label={alert.level === 'RED' ? '红色' : alert.level === 'YELLOW' ? '黄色' : '蓝色'}
                    color={alert.level === 'RED' ? 'error' : 'warning'}
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>{alert.title}</Typography>
                  <Chip
                    size="small"
                    label={alert.status === 'PENDING' ? '待处理' : '已处理'}
                    variant="outlined"
                  />
                </Box>
              ))}
              {(!data.recentAlerts || data.recentAlerts.length === 0) && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                  暂无预警信息
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
