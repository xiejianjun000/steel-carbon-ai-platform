import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import ReactECharts from 'echarts-for-react';

/**
 * 工序监控页面 - 各工序碳排放实时监控
 */
export default function ProcessMonitor() {
  const processes = [
    { id: 1, name: '烧结', status: 'normal', emission: 82500, target: 90000, rate: 91.7 },
    { id: 2, name: '炼铁', status: 'warning', emission: 165000, target: 170000, rate: 97.1 },
    { id: 3, name: '炼钢', status: 'normal', emission: 42000, target: 50000, rate: 84.0 },
    { id: 4, name: '焦化', status: 'normal', emission: 15832, target: 20000, rate: 79.2 },
    { id: 5, name: '轧钢', status: 'normal', emission: 4000, target: 6000, rate: 66.7 },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>工序碳排放监控</Typography>
      <Grid container spacing={3}>
        {processes.map((proc) => {
          const gaugeOption = {
            series: [{
              type: 'gauge',
              startAngle: 200,
              endAngle: -20,
              min: 0,
              max: 100,
              progress: { show: true, width: 14 },
              pointer: { show: false },
              axisLine: { lineStyle: { width: 14, color: [[0.7, '#4caf50'], [0.9, '#ff9800'], [1, '#f44336']] } },
              axisTick: { show: false },
              splitLine: { show: false },
              axisLabel: { show: false },
              detail: {
                fontSize: 20,
                fontWeight: 'bold',
                formatter: '{value}%',
                color: proc.rate > 90 ? '#ff9800' : '#4caf50',
              },
              data: [{ value: proc.rate }],
            }],
          };

          return (
            <Grid item xs={12} sm={6} md={4} key={proc.id}>
              <Card className="card-hover">
                <CardContent>
                  <Typography variant="h6" gutterBottom>{proc.name}工序</Typography>
                  <ReactECharts option={gaugeOption} style={{ height: 180 }} />
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    排放量: {proc.emission.toLocaleString()} / {proc.target.toLocaleString()} tCO\u2082
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
