/**
 * 数据同步状态栏
 * DataSyncStatus - 显示各工序数据同步状态
 */
import { Box, Paper, Typography, Chip, LinearProgress, Tooltip, IconButton, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import SyncIcon from '@mui/icons-material/Sync';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { DataSyncStatus } from '../types/controlPanel';
import { PROCESS_NAMES } from '../types/controlPanel';

interface DataSyncStatusBarProps {
  statuses: DataSyncStatus[];
  loading?: boolean;
  onRefresh?: () => void;
  onProcessClick?: (processId: number) => void;
}

const getStatusIcon = (status: DataSyncStatus['status']) => {
  switch (status) {
    case 'synced':
      return <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />;
    case 'pending':
      return <SyncIcon sx={{ fontSize: 14, color: 'warning.main', animation: 'spin 1s linear infinite' }} />;
    case 'error':
      return <ErrorIcon sx={{ fontSize: 14, color: 'error.main' }} />;
    case 'partial':
      return <WarningIcon sx={{ fontSize: 14, color: 'warning.main' }} />;
  }
};

const getStatusLabel = (status: DataSyncStatus['status']) => {
  switch (status) {
    case 'synced':
      return '已同步';
    case 'pending':
      return '同步中';
    case 'error':
      return '同步失败';
    case 'partial':
      return '部分同步';
  }
};

// CSS动画（需要添加keyframes到全局样式）
const spinKeyframes = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

export default function DataSyncStatusBar({
  statuses,
  loading,
  onRefresh,
  onProcessClick,
}: DataSyncStatusBarProps) {
  // 计算总体统计
  const total = statuses.length;
  const syncedCount = statuses.filter(s => s.status === 'synced').length;
  const errorCount = statuses.filter(s => s.status === 'error').length;
  const avgAutoRate = total > 0 ? statuses.reduce((sum, s) => sum + s.autoRate, 0) / total : 0;
  const totalManualCount = statuses.reduce((sum, s) => sum + s.manualCount, 0);
  const totalAnomalyCount = statuses.reduce((sum, s) => sum + s.anomalyCount, 0);

  return (
    <>
      {/* CSS动画注入 */}
      <style>{spinKeyframes}</style>

      <Paper
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'grey.50',
          flexWrap: 'wrap',
        }}
      >
        {/* 标题 */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
          📊 今日数据同步:
        </Typography>

        {/* 工序状态列表 */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: 1 }}>
          {statuses.map((status) => (
            <Tooltip
              key={status.processId}
              title={
                <Box>
                  <Typography variant="caption" display="block">
                    {PROCESS_NAMES[status.processId] || `工序${status.processId}`}
                  </Typography>
                  <Typography variant="caption" display="block">
                    自动采集率: {status.autoRate}%
                  </Typography>
                  <Typography variant="caption" display="block">
                    手工待审: {status.manualCount}条
                  </Typography>
                  {status.anomalyCount > 0 && (
                    <Typography variant="caption" display="block" color="warning.main">
                      异常: {status.anomalyCount}条
                    </Typography>
                  )}
                  <Typography variant="caption" display="block">
                    上次同步: {status.lastSyncTime}
                  </Typography>
                </Box>
              }
            >
              <Chip
                icon={loading ? <CircularProgress size={14} /> : getStatusIcon(status.status)}
                label={PROCESS_NAMES[status.processId] || `工序${status.processId}`}
                size="small"
                color={status.status === 'synced' ? 'success' : status.status === 'error' ? 'error' : 'default'}
                variant={status.status === 'synced' ? 'filled' : 'outlined'}
                onClick={() => onProcessClick?.(status.processId)}
                sx={{ cursor: 'pointer' }}
              />
            </Tooltip>
          ))}
        </Box>

        {/* 统计信息 */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* 自动采集率 */}
          <Tooltip title="自动采集率">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                自动:
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {avgAutoRate.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={avgAutoRate}
                sx={{ width: 40, height: 4, borderRadius: 2 }}
              />
            </Box>
          </Tooltip>

          {/* 手工待审 */}
          {totalManualCount > 0 && (
            <Chip
              size="small"
              label={`手工待审: ${totalManualCount}`}
              color="warning"
              variant="outlined"
              sx={{ height: 24, fontSize: 11 }}
            />
          )}

          {/* 异常告警 */}
          {totalAnomalyCount > 0 && (
            <Chip
              size="small"
              label={`异常: ${totalAnomalyCount}`}
              color="error"
              sx={{ height: 24, fontSize: 11 }}
            />
          )}

          {/* 同步状态 */}
          <Chip
            size="small"
            label={`${syncedCount}/${total} 已同步`}
            color={syncedCount === total ? 'success' : 'default'}
            variant={syncedCount === total ? 'filled' : 'outlined'}
            sx={{ height: 24, fontSize: 11 }}
          />

          {/* 刷新按钮 */}
          {onRefresh && (
            <IconButton size="small" onClick={onRefresh} disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Paper>
    </>
  );
}
