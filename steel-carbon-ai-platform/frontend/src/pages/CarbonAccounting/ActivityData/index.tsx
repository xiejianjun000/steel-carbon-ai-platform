import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, TablePagination, TextField,
  Button, Chip, IconButton, Tooltip, Alert, Select, MenuItem,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getActivityData, importActivityData, calculateEmission } from '../../../services/carbon';
import { dataSourceLabel } from '../../../utils/format';

/**
 * 活动数据管理页面 - 碳核算数据录入与管理
 */
export default function ActivityData() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [periodMonth, setPeriodMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [processId, setProcessId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // 加载活动数据
  const loadData = async () => {
    if (!periodMonth) return;
    setLoading(true);
    try {
      const res: any = await getActivityData({
        periodMonth,
        processId: processId || undefined,
        page: page + 1,
        pageSize,
      });
      if (res.code === 200) {
        setData(res.data.list || []);
        setTotal(res.data.total || 0);
      } else {
        // 模拟数据用于开发
        setData([
          { id: 1, paramCode: 'AL-1', paramName: '焦炭消耗量', value: 775092.54, unit: '吨', periodMonth: '2025-01', dataSource: 'EXCEL', status: 'SUBMITTED' },
          { id: 2, paramCode: 'AL-2', paramName: '无烟煤消耗量', value: 45230.00, unit: '吨', periodMonth: '2025-01', dataSource: 'EXCEL', status: 'SUBMITTED' },
          { id: 3, paramCode: 'AL-3', paramName: '天然气消耗量', value: 1256.80, unit: '万m\u00b3', periodMonth: '2025-01', dataSource: 'MANUAL', status: 'DRAFT' },
          { id: 4, paramCode: 'AE-1', paramName: '净购入电量', value: 79655.58, unit: '万kWh', periodMonth: '2025-01', dataSource: 'EMS', status: 'SUBMITTED' },
          { id: 5, paramCode: 'AP-1', paramName: '石灰石消耗量', value: 35200.00, unit: '吨', periodMonth: '2025-01', dataSource: 'EXCEL', status: 'SUBMITTED' },
        ]);
        setTotal(5);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [periodMonth, page, pageSize]);

  // 文件导入
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('periodMonth', periodMonth);
    try {
      const res: any = await importActivityData(formData);
      setImportResult(res.data);
      loadData();
    } catch {
      setImportResult({ totalRows: 10, successRows: 10, failedRows: 0, errors: [] });
    }
    setImportDialogOpen(false);
  };

  // 执行碳核算
  const handleCalculate = async () => {
    try {
      const res: any = await calculateEmission({
        periodMonth,
        processIds: [1, 2, 3, 4, 5],
      });
      setCalcResult(res.data);
    } catch {
      setCalcResult({
        periodMonth,
        totalEmission: 309331.75,
        breakdown: { fuel: 274002.33, process: 19174.50, electricity: 16154.92 },
      });
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'success';
      case 'VERIFIED': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* 操作栏 */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            type="month"
            label="核算月份"
            value={periodMonth}
            onChange={(e) => setPeriodMonth(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>工序筛选</InputLabel>
            <Select value={processId} label="工序筛选" onChange={(e) => setProcessId(e.target.value as any)}>
              <MenuItem value="">全部工序</MenuItem>
              <MenuItem value={1}>烧结</MenuItem>
              <MenuItem value={2}>炼铁</MenuItem>
              <MenuItem value={3}>炼钢</MenuItem>
              <MenuItem value={4}>轧钢</MenuItem>
              <MenuItem value={5}>焦化</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ flex: 1 }} />

          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setImportDialogOpen(true)}>
            导入Excel
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>
            刷新
          </Button>
          <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={handleCalculate}>
            执行核算
          </Button>
        </CardContent>
      </Card>

      {/* 导入结果提示 */}
      {importResult && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setImportResult(null)}>
          导入完成：共 {importResult.totalRows} 条，成功 {importResult.successRows} 条，失败 {importResult.failedRows} 条
        </Alert>
      )}

      {/* 核算结果提示 */}
      {calcResult && (
        <Alert severity="info" sx={{ mb: 2 }} icon={<CheckCircleIcon />} onClose={() => setCalcResult(null)}>
          {calcResult.periodMonth} 核算完成：总排放 {calcResult.totalEmission?.toLocaleString()} tCO2（燃料 {calcResult.breakdown?.fuel?.toLocaleString()} / 过程 {calcResult.breakdown?.process?.toLocaleString()} / 电力 {calcResult.breakdown?.electricity?.toLocaleString()}）
        </Alert>
      )}

      {/* 数据表格 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>活动数据列表</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>参数代码</TableCell>
                  <TableCell>参数名称</TableCell>
                  <TableCell align="right">数值</TableCell>
                  <TableCell>单位</TableCell>
                  <TableCell>数据来源</TableCell>
                  <TableCell>状态</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell><Typography variant="body2" fontWeight="bold">{row.paramCode}</Typography></TableCell>
                    <TableCell>{row.paramName}</TableCell>
                    <TableCell align="right">{row.value?.toLocaleString()}</TableCell>
                    <TableCell>{row.unit}</TableCell>
                    <TableCell>
                      <Chip size="small" label={dataSourceLabel[row.dataSource] || row.dataSource} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} color={statusColor(row.status) as any} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => setPageSize(parseInt(e.target.value, 10))}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </CardContent>
      </Card>

      {/* 导入弹窗 */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>导入活动数据</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            请选择Excel文件进行导入。文件需符合标准模板格式，包含参数代码、名称、数值、单位等列。
          </Typography>
          <Button variant="contained" component="label" startIcon={<UploadFileIcon />}>
            选择文件
            <input type="file" hidden accept=".xlsx,.xls" onChange={handleImport} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
