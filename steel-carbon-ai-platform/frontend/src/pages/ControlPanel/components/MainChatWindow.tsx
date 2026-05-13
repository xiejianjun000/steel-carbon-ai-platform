/**
 * 中央对话窗口组件
 * MainChatWindow - 主对话界面
 */
import { Box, Card, CardContent, TextField, Button, Typography, CircularProgress, Chip, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import type { ChatMessage } from '../types/controlPanel';

interface MainChatWindowProps {
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (message: string) => void;
  onRefresh?: () => void;
  selectedAgentName?: string;
}

export default function MainChatWindow({
  messages,
  loading,
  onSendMessage,
  onRefresh,
  selectedAgentName = '大管家',
}: MainChatWindowProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !loading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ py: 1.5, px: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
        <SmartToyIcon color="primary" />
        <Typography variant="h6" sx={{ flex: 1 }}>
          {selectedAgentName}
        </Typography>
        {onRefresh && (
          <IconButton size="small" onClick={onRefresh} title="刷新">
            <RefreshIcon fontSize="small" />
          </IconButton>
        )}
        <Chip
          size="small"
          label={loading ? '处理中...' : '就绪'}
          color={loading ? 'warning' : 'success'}
          variant="outlined"
          sx={{ height: 24 }}
        />
      </CardContent>

      {/* 消息区域 */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SmartToyIcon sx={{ fontSize: 64, color: 'grey.300' }} />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              碳排放AI智能助手
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              请选择左侧智能体，开始与AI对话
            </Typography>

            {/* 快捷问题 */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                '帮我核算2025年1月的烧结碳排放',
                '今日各工序数据同步完成了吗？',
                '检查本周碳排放是否有异常',
                '生成今日碳排放简报',
              ].map((q) => (
                <Chip
                  key={q}
                  label={q}
                  variant="outlined"
                  size="small"
                  onClick={() => setInput(q)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* 加载中 */}
        {loading && messages.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              AI正在思考...
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* 输入区域 */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="输入您的问题或指令..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            size="small"
            disabled={loading}
            sx={{ bgcolor: 'white' }}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            sx={{ minWidth: 56 }}
          >
            <SendIcon />
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          按Enter发送，Shift+Enter换行。支持自然语言指令和大管家多Agent协同调度。
        </Typography>
      </Box>
    </Card>
  );
}
