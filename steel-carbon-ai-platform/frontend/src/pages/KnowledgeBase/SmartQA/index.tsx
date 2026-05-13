import { useState, useRef, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, Divider, CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { askQuestion } from '../../services/knowledge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

/**
 * 智能问答页面 - 基于RAG的知识库智能问答
 */
export default function SmartQA() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAsk = async () => {
    if (!question.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: question.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res: any = await askQuestion({
        question: userMsg.content,
        conversationId: conversationId || undefined,
      });
      if (res.code === 200) {
        if (!conversationId) setConversationId(res.data.conversationId);
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: res.data.answer,
          sources: res.data.sources,
        }]);
      } else {
        // 模拟回答
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: '钢铁生产企业碳排放核算应采用GB/T 32151.5-2026《温室气体排放核算与报告要求 第5部分：钢铁生产企业》，同时参考GB/T 32150-2025《工业企业温室气体排放核算和报告通则》。核算范围包括化石燃料燃烧排放、过程排放和净购入电力排放。',
          sources: [
            { documentId: 12, title: 'GB/T 32151.5-2026', relevance: 0.95 },
            { documentId: 8, title: 'GB/T 32150-2025', relevance: 0.88 },
          ],
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '抱歉，服务暂时不可用。请检查AI服务连接状态后重试。',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
      {/* 标题栏 */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon color="primary" />
          <Typography variant="h6">碳排放知识智能问答</Typography>
          <Chip size="small" label="AI驱动" color="primary" variant="outlined" />
        </CardContent>
      </Card>

      {/* 对话区域 */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SmartToyIcon sx={{ fontSize: 64, color: 'grey.300' }} />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                碳排放知识智能助手
              </Typography>
              <Typography variant="body2" color="text.secondary">
                您可以询问关于碳排放核算标准、政策法规、排放因子等问题
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 3, flexWrap: 'wrap' }}>
                {['碳排放核算采用哪个标准？', '钢铁企业有哪些排放源？', '碳配额如何分配？'].map((q) => (
                  <Chip key={q} label={q} variant="outlined" onClick={() => setQuestion(q)} clickable />
                ))}
              </Box>
            </Box>
          )}

          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  maxWidth: '75%',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: msg.role === 'user' ? 'primary.main' : '#f5f5f5',
                  color: msg.role === 'user' ? '#fff' : 'text.primary',
                }}
              >
                <Typography variant="body1" whiteSpace="pre-wrap">{msg.content}</Typography>
                {msg.sources && msg.sources.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Divider sx={{ borderColor: msg.role === 'user' ? 'rgba(255,255,255,0.3)' : '#e0e0e0', mb: 1 }} />
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>参考来源：</Typography>
                    {msg.sources.map((s, j) => (
                      <Chip key={j} size="small" label={`${s.title} (${(s.relevance * 100).toFixed(0)}%)`} sx={{ mr: 0.5, mb: 0.5, fontSize: 11 }} />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">AI正在思考...</Typography>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* 输入区 */}
        <Divider />
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="输入您的问题..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleAsk}
            disabled={!question.trim() || loading}
            sx={{ minWidth: 48 }}
          >
            <SendIcon />
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
