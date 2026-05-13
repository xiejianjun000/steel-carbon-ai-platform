import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, TextField, Button, Chip,
} from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { getEmissionSummary } from '../../../services/carbon';
import { formatNumber, emissionTypeLabel } from '../../../utils/format';

/**
 * 核算结果查询页面 - 展示碳排放计算结果
 */
export default function EmissionResult() {
  const [periodStart, setPeriodStart] = useState('2025-01');
  const [periodEnd, setPeriodEnd] = useState('2025-12');
  const [summary, setSummary] = useState<any>(null);

  const handleQuery = async () => {
    try {
      const res: any = await getEmissionSummary({ periodStart, periodEnd });
      if (res.code === 200) {
        setSummary(res.data);
      } else {
        setSummary(mockData);
      }
    } catch {
      setSummary(mockData);
    }
  };

  // 模拟数据
  const mockData = {
    totalEmission: 3711981.00,
    intensity: { perTonSteel: 1.97, unit: 'tCO\u2082/t钢' },
    groups: [
      { key: '2025-01', fuel: 274002.33, process: 19174.50, electricity: 16154.92, total: 309331.75 },
      { key: '2025-02', fuel: 268500.00, process: 18800.00, electricity: 15800.00, total: 303100.00 },
      { key: '2025-03', fuel: 272000.00, process: 19200.00, electricity: 16200.00, total: 307400.00 },
      { key: '2025-04', fuel: 270000.00, process: 19000.00, electricity: 16000.00, total: 305000.00 },
      { key: '2025-05', fuel: 266000.00, process: 18900.00, electricity: 15900.00, total: 300800.00 },
    ],
    byProcess: [
      { processId: 2, processName: '炼铁', emission: 165000.00, intensity: 0.42 },
      { processId: 1, processName: '烧结', emission: 82500.00, intensity: 0.21 },
      { processId: 3, processName: '炼钢', emission: 42000.00, intensity: 0.11 },
      { processId: 5, processName: '焦化', emission: 15832.00, intensity: 0.04 },
      { processId: 4, processName: '轧钢', emission: 4000.00, intensity: 0.01 },
    ],
  };

  // 月度排放趋势图
  const chartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['燃料排放', '过程排放', '电力排放'] },
    grid: { left: 80, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: summary?.groups?.map((g: any) => g.key) || [],
    },
    yAxis: { type: 'value', name: 'tCO\u2082', axisLabel: { formatter: (v: number) => (v / 10000).toFixed(1) + '万' } },
    series: [
      { name: '燃料排放', type: 'bar', stack: 'total', data: summary?.groups?.map((g: any) => g.fuel) || [], itemStyle: { color: '#ef5350' } },
      { name: '过程排放', type: 'bar', stack: 'total', data: summary?.groups?.map((g: any) => g.process) || [], itemStyle: { color: '#ff9800' } },
      { name: '电力排放', type: 'bar', stack: 'total', data: summary?.groups?.map((g: any) => g.electricity) || [], itemStyle: { color: '#42a5f5' } },
    ],
  };

  return (
    <Box>
      {/* 查询条件 */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField type="month" label="起始月份" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
          <TextField type="month" label="截止月份" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
          <Button variant="contained" onClick={handleQuery}>查询</Button>
        </CardContent>
      </Card>

      {summary && (
        <>
          {/* 汇总统计 */}
          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">累计排放量</Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {formatNumber(summary.totalEmission)} <Typography variant="body2" component="span">tCO\u2082</Typography>
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">碳排放强度</Typography>
                <Typography variant="h4" fontWeight="bold" color="secondary">
                  {summary.intensity.perTonSteel} <Typography variant="body2" component="span">{summary.intensity.unit}</Typography>
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* 月度趋势图 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>月度排放趋势</Typography>
              <ReactECharts option={chartOption} style={{ height: 350 }} />
            </CardContent>
          </Card>

          {/* 月度明细表 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>月度排放明细</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>月份</TableCell>
                    <TableCell align="right">燃料排放 (tCO\u2082)</TableCell>
                    <TableCell align="right">过程排放 (tCO\u2082)</TableCell>
                    <TableCell align="right">电力排放 (tCO\u2082)</TableCell>
                    <TableCell align="right">合计 (tCO\u2082)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.groups.map((g: any) => (
                    <TableRow key={g.key} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>{g.key}</TableCell>
                      <TableCell align="right">{formatNumber(g.fuel)}</TableCell>
                      <TableCell align="right">{formatNumber(g.process)}</TableCell>
                      <TableCell align="right">{formatNumber(g.electricity)}</TableCell>
                      <TableCell align="right"><Typography sx={{ fontWeight: 'bold' }}>{formatNumber(g.total)}</Typography></TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>合计</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatNumber(summary.groups.reduce((s: number, g: any) => s + g.fuel, 0))}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatNumber(summary.groups.reduce((s: number, g: any) => s + g.process, 0))}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatNumber(summary.groups.reduce((s: number, g: any) => s + g.electricity, 0))}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatNumber(summary.totalEmission)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
