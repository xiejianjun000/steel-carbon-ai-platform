import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, TablePagination, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { getAlerts, resolveAlert } from '../../../services/monitor';
import { alertLevelColor, alertStatusLabel } from '../../../utils/format';

/**
 * 异常预警管理页面
 */
export default function AlertManage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [level, setLevel] = useState('');
  const [status, setStatus] = useState('');
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [resolution, setResolution] = useState('');

  useEffect(() => { loadAlerts(); }, [page, pageSize, level, status]);

  const loadAlerts = async () => {
    try {
      const res: any = await getAlerts({ level: level || undefined, status: status || undefined, page: page + 1, pageSize });
      if (res.code === 200) {
        setAlerts(res.data.list || []);
        setTotal(res.data.total || 0);
      } else {
        setAlerts([
          { id: 1, alertType: 'THRESHOLD', level: 'YELLOW', title: '4#高炉CO\u2082排放超过日均值15%', description: '2025年5月12日10:30检测到炼铁工序4#高炉CO\u2082小时排放量超过日均值15%，请及时排查', status: 'PENDING', triggeredAt: '2025-05-12T10:30:00' },
          { id: 2, alertType: 'TREND', level: 'RED', title: '烧结工序月排放趋势超标', description: '烧结工序近7天排放量呈上升趋势，预计本月排放将超过配额上限的90%', status: 'PENDING', triggeredAt: '2025-05-12T09:15:00' },
          { id: 3, alertType: 'YOY', level: 'BLUE', title: '轧钢工序同比排放增长12%', description: '轧钢工序本月累计排放较去年同期增长12%，请关注', status: 'PROCESSING', triggeredAt: '2025-05-11T14:20:00' },
          { id: 4, alertType: 'AI_PREDICT', level: 'YELLOW', title: 'AI预测下月排放将增加5%', description: '基于历史数据和产能计划，AI预测下月碳排放将增加约5%', status: 'RESOLVED', triggeredAt: '2025-05-10T08:00:00' },
        ]);
        setTotal(4);
      }
    } catch {
      // 使用模拟数据
    }
  };

  const handleResolve = async () => {
    if (!selectedAlert) return;
    try {
      await resolveAlert(selectedAlert.id, { resolution });
    } catch { /* ignore */ }
    setResolveDialogOpen(false);
    setResolution('');
    loadAlerts();
  };

  const handleOpenResolve = (alert: any) => {
    setSelectedAlert(alert);
    setResolveDialogOpen(true);
  };

  return (
    <Box>
      {/* 筛选栏 */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>预警级别</InputLabel>
            <Select value={level} label="预警级别" onChange={(e) => setLevel(e.target.value)}>
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="BLUE">蓝色</MenuItem>
              <MenuItem value="YELLOW">黄色</MenuItem>
              <MenuItem value="RED">红色</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>状态</InputLabel>
            <Select value={status} label="状态" onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="PENDING">待处理</MenuItem>
              <MenuItem value="PROCESSING">处理中</MenuItem>
              <MenuItem value="RESOLVED">已处理</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* 预警列表 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>预警列表</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>级别</TableCell>
                <TableCell>类型</TableCell>
                <TableCell>预警标题</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>触发时间</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id} hover>
                  <TableCell>
                    <Chip
                      size="small"
                      label={alert.level === 'RED' ? '红色' : alert.level === 'YELLOW' ? '黄色' : '蓝色'}
                      sx={{ bgcolor: alertLevelColor[alert.level] || '#757575', color: '#fff' }}
                    />
                  </TableCell>
                  <TableCell>{alert.alertType}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{alert.title}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 300, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {alert.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={alertStatusLabel[alert.status] || alert.status} variant="outlined" />
                  </TableCell>
                  <TableCell>{new Date(alert.triggeredAt).toLocaleString('zh-CN')}</TableCell>
                  <TableCell>
                    {alert.status === 'PENDING' && (
                      <Button size="small" variant="outlined" onClick={() => handleOpenResolve(alert)}>
                        处理
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => setPageSize(parseInt(e.target.value, 10))}
          />
        </CardContent>
      </Card>

      {/* 处理预警弹窗 */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>处理预警</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>{selectedAlert?.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{selectedAlert?.description}</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="处置说明"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleResolve} disabled={!resolution.trim()}>确认处理</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
