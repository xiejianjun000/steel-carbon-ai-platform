import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, Tabs, Tab,
} from '@mui/material';
import { getEmissionFactors } from '../../../services/carbon';

/**
 * 排放因子管理页面
 */
export default function EmissionFactor() {
  const [factors, setFactors] = useState<any[]>([]);
  const [tab, setTab] = useState('FUEL');

  useEffect(() => {
    loadFactors();
  }, [tab]);

  const loadFactors = async () => {
    try {
      const res: any = await getEmissionFactors({ category: tab });
      if (res.code === 200) {
        setFactors(res.data || []);
      } else {
        setFactors([
          { id: 1, name: '焦炭', code: 'FUEL_COKE', category: 'FUEL', value: 28.435, unit: 'TJ/万吨', sourceType: 'NATIONAL', standardRef: 'GB/T 32150-2025', carbonContent: 94.000, oxidationRate: 0.988 },
          { id: 2, name: '无烟煤', code: 'FUEL_ANTHRACITE', category: 'FUEL', value: 20.908, unit: 'TJ/万吨', sourceType: 'NATIONAL', standardRef: 'GB/T 32150-2025', carbonContent: 93.600, oxidationRate: 0.940 },
          { id: 3, name: '烟煤', code: 'FUEL_BITUMINOUS', category: 'FUEL', value: 20.908, unit: 'TJ/万吨', sourceType: 'NATIONAL', standardRef: 'GB/T 32150-2025', carbonContent: 80.700, oxidationRate: 0.981 },
          { id: 4, name: '天然气', code: 'FUEL_NATGAS', category: 'FUEL', value: 389.31, unit: 'TJ/万m\u00b3', sourceType: 'NATIONAL', standardRef: 'GB/T 32150-2025', carbonContent: 15.300, oxidationRate: 0.995 },
        ]);
      }
    } catch {
      // 模拟数据
    }
  };

  const categoryLabel: Record<string, string> = {
    FUEL: '化石燃料',
    PROCESS: '过程排放',
    ELECTRICITY: '电力排放',
  };

  const categoryFactors: Record<string, any[]> = {
    FUEL: [
      { id: 1, name: '焦炭', code: 'FUEL_COKE', value: 28.435, unit: 'TJ/万吨', carbonContent: 94.000, oxidationRate: 0.988 },
      { id: 2, name: '无烟煤', code: 'FUEL_ANTHRACITE', value: 20.908, unit: 'TJ/万吨', carbonContent: 93.600, oxidationRate: 0.940 },
      { id: 3, name: '烟煤', code: 'FUEL_BITUMINOUS', value: 20.908, unit: 'TJ/万吨', carbonContent: 80.700, oxidationRate: 0.981 },
      { id: 4, name: '天然气', code: 'FUEL_NATGAS', value: 389.31, unit: 'TJ/万m\u00b3', carbonContent: 15.300, oxidationRate: 0.995 },
    ],
    PROCESS: [
      { id: 5, name: '石灰石分解', code: 'PROC_LIMESTONE', value: 0.4397, unit: 'tCO\u2082/t', carbonContent: null, oxidationRate: null },
      { id: 6, name: '白云石分解', code: 'PROC_DOLOMITE', value: 0.4743, unit: 'tCO\u2082/t', carbonContent: null, oxidationRate: null },
    ],
    ELECTRICITY: [
      { id: 7, name: '华中电网', code: 'ELEC_CENTRAL', value: 0.5810, unit: 'tCO\u2082/MWh', carbonContent: null, oxidationRate: null },
    ],
  };

  const displayFactors = factors.length > 0 ? factors : (categoryFactors[tab] || []);

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>排放因子管理</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            依据GB/T 32150-2025标准管理的排放因子数据。排放因子用于碳排放核算计算。
          </Typography>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab value="FUEL" label="化石燃料" />
            <Tab value="PROCESS" label="过程排放" />
            <Tab value="ELECTRICITY" label="电力排放" />
          </Tabs>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>编码</TableCell>
                <TableCell>名称</TableCell>
                <TableCell align="right">因子值</TableCell>
                <TableCell>单位</TableCell>
                <TableCell align="right">含碳量 (tc/TJ)</TableCell>
                <TableCell align="right">氧化率</TableCell>
                <TableCell>来源</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayFactors.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell><Typography variant="body2" fontFamily="monospace">{row.code}</Typography></TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">{row.value}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell align="right">{row.carbonContent ?? '-'}</TableCell>
                  <TableCell align="right">{row.oxidationRate ?? '-'}</TableCell>
                  <TableCell>
                    <Chip size="small" label="国家标准" color="primary" variant="outlined" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
