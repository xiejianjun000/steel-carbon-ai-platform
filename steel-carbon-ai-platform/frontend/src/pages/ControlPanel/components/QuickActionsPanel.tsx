/**
 * 快捷操作面板
 * QuickActions - 常用操作快捷入口
 */
import { Box, Paper, Button, Typography, Divider, Chip } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedIcon from '@mui/icons-material/Verified';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';

interface QuickAction {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  agentId?: number;
}

interface QuickActionsPanelProps {
  onAction: (actionId: string, agentId?: number) => void;
  disabled?: boolean;
  recentActions?: string[];
}

export default function QuickActionsPanel({ onAction, disabled, recentActions = [] }: QuickActionsPanelProps) {
  const actions: QuickAction[] = [
    {
      id: 'daily_report',
      name: '日报生成',
      icon: <AssessmentIcon />,
      description: '生成今日碳排放简报',
      color: 'primary',
    },
    {
      id: 'data_sync',
      name: '数据上传',
      icon: <CloudUploadIcon />,
      description: '触发各工序数据同步',
      color: 'info',
    },
    {
      id: 'compliance_check',
      name: '合规审查',
      icon: <VerifiedIcon />,
      description: '93项检查点自动审查',
      color: 'success',
    },
    {
      id: 'alert_review',
      name: '预警查看',
      icon: <NotificationsActiveIcon />,
      description: '查看当日异常告警',
      color: 'warning',
    },
    {
      id: 'full_calculation',
      name: '全量核算',
      icon: <PlayArrowIcon />,
      description: '5大工序碳排放核算',
      color: 'secondary',
    },
    {
      id: 'sync_history',
      name: '同步历史',
      icon: <HistoryIcon />,
      description: '查看数据同步记录',
      color: 'default',
    },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          📎 快捷操作
        </Typography>
        <Chip
          size="small"
          label="大管家调度"
          variant="outlined"
          sx={{ height: 20, fontSize: 10 }}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outlined"
            size="small"
            startIcon={action.icon}
            onClick={() => onAction(action.id, action.agentId)}
            disabled={disabled}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              py: 1,
              px: 1.5,
              flexDirection: 'column',
              alignItems: 'flex-start',
              borderColor: 'divider',
              '&:hover': {
                borderColor: `${action.color || 'primary'}.main`,
                bgcolor: `${action.color || 'primary'}.50`,
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 12 }}>
              {action.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
              {action.description}
            </Typography>
          </Button>
        ))}
      </Box>

      {/* 最近操作 */}
      {recentActions.length > 0 && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="caption" color="text.secondary">
            最近操作:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
            {recentActions.slice(0, 3).map((actionId, index) => {
              const action = actions.find(a => a.id === actionId);
              return action ? (
                <Chip
                  key={index}
                  size="small"
                  label={action.name}
                  variant="outlined"
                  sx={{ height: 20, fontSize: 10 }}
                />
              ) : null;
            })}
          </Box>
        </>
      )}
    </Paper>
  );
}
