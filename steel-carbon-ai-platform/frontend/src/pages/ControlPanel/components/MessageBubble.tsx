/**
 * 消息气泡组件
 * MessageBubble - 对话消息展示
 */
import { Box, Typography, Chip, Divider, CircularProgress, Paper } from '@mui/material';
import type { ChatMessage, TaskProgress } from '../types/controlPanel';

interface MessageBubbleProps {
  message: ChatMessage;
  onAgentClick?: (agentId: number) => void;
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const getRoleLabel = (role: string, agentName?: string) => {
  if (role === 'user') return '用户';
  if (role === 'system') return '系统';
  if (role === 'master') return '🤖 大管家';
  if (agentName) return `🤖 ${agentName}`;
  return '🤖 AI助手';
};

export default function MessageBubble({ message, onAgentClick }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isMaster = message.role === 'master';

  // 渲染任务进度
  const renderTaskProgress = (progress: TaskProgress) => {
    return (
      <Box
        sx={{
          mt: 1,
          p: 1.5,
          bgcolor: 'grey.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            → {progress.agentName} Agent
          </Typography>
          <Chip
            size="small"
            label={progress.status === 'done' ? '完成' : progress.status === 'working' ? '执行中' : '等待'}
            color={progress.status === 'done' ? 'success' : progress.status === 'working' ? 'primary' : 'default'}
            sx={{ height: 18, fontSize: 10 }}
          />
        </Box>

        {progress.status === 'working' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">
              {progress.description}
            </Typography>
          </Box>
        )}

        {progress.status === 'done' && progress.result && (
          <Box sx={{ fontSize: 13 }}>
            {Object.entries(progress.result).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                  {key}:
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {typeof value === 'number' ? value.toLocaleString() : String(value)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  // 系统消息样式
  if (isSystem) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <Chip
          label={message.content}
          size="small"
          sx={{ bgcolor: 'grey.200', fontSize: 12 }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: '80%',
          p: 2,
          borderRadius: 2,
          bgcolor: isUser ? 'primary.main' : '#f5f5f5',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          boxShadow: 1,
        }}
      >
        {/* 消息头 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: isUser ? 'inherit' : 'primary.main',
            }}
          >
            {getRoleLabel(message.role, message.agentName)}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.7,
              fontSize: 10,
              color: isUser ? 'inherit' : 'text.secondary',
            }}
          >
            {formatTime(message.timestamp)}
          </Typography>
        </Box>

        <Divider sx={{ my: 1, opacity: isUser ? 0.3 : 0.5 }} />

        {/* 消息内容 */}
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {message.content}
        </Typography>

        {/* 任务进度列表 */}
        {message.taskProgress && message.taskProgress.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              任务执行进度:
            </Typography>
            {message.taskProgress.map((task, index) => (
              <Box key={task.taskId || index}>
                {renderTaskProgress(task)}
              </Box>
            ))}
          </Box>
        )}

        {/* 附件 */}
        {message.attachments && message.attachments.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {message.attachments.map((att) => (
              <Chip
                key={att.id}
                size="small"
                label={att.name}
                sx={{ mr: 0.5, mt: 0.5 }}
                onClick={() => window.open(att.url, '_blank')}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
