/**
 * 控制面板主页面
 * ControlPanel - AI智能体大管家统一入口
 *
 * 冷钢碳排放AI智慧管理平台
 *
 * 功能：
 * 1. 左侧智能体选择面板（12智能体状态）
 * 2. 中央对话窗口（多Agent协同对话）
 * 3. 数据同步状态栏
 * 4. 快捷操作面板
 * 5. AI建议面板
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

import AgentSidebar from './components/AgentSidebar';
import MainChatWindow from './components/MainChatWindow';
import DataSyncStatusBar from './components/DataSyncStatusBar';
import QuickActionsPanel from './components/QuickActionsPanel';

import {
  getAgentStatus,
  sendChatMessage,
  getDataSyncStatus,
  triggerDataSync,
} from './api/controlPanelApi';

import {
  AGENTS,
  PROCESS_NAMES,
} from './types/controlPanel';
import type {
  AgentStatus,
  ChatMessage,
  DataSyncStatus,
} from './types/controlPanel';

// 生成唯一ID
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function ControlPanel() {
  // 状态
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [selectedAgent, setSelectedAgent] = useState(12); // 默认大管家
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [dataStatuses, setDataStatuses] = useState<DataSyncStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [recentActions, setRecentActions] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([
    '烧结焦比偏高，建议优化配料方案',
    '今日数据已就绪，可发起核算',
    '本周碳排放强度较上周下降2.3%',
  ]);

  // 获取当前选中智能体名称
  const selectedAgentInfo = AGENTS.find((a) => a.id === selectedAgent) || { name: '大管家' };

  // 加载智能体状态
  const loadAgentStatus = useCallback(async () => {
    setLoadingAgents(true);
    try {
      // 模拟数据（实际应从API获取）
      const mockAgents: AgentStatus[] = [
        { id: 12, name: '大管家', description: '统一入口', category: 'master', status: 'idle', lastActive: new Date().toLocaleTimeString() },
        { id: 1, name: '石灰窑', description: '煅烧工艺', category: 'process', status: 'idle', lastActive: '09:30' },
        { id: 2, name: '烧结', description: '烧结工艺', category: 'process', status: 'idle', lastActive: '09:45' },
        { id: 3, name: '高炉', description: '高炉工艺', category: 'process', status: 'idle', lastActive: '09:50' },
        { id: 4, name: '转炉', description: '转炉工艺', category: 'process', status: 'idle', lastActive: '09:55' },
        { id: 6, name: '轧钢', description: '轧钢工艺', category: 'process', status: 'idle', lastActive: '10:00' },
        { id: 7, name: '碳核算引擎', description: '核算服务', category: 'support', status: 'idle', lastActive: '10:05' },
        { id: 8, name: '双碳合规', description: '合规服务', category: 'support', status: 'idle', lastActive: '10:10' },
        { id: 9, name: '数据采集', description: '数据服务', category: 'support', status: 'working', lastActive: '10:12', currentTask: '正在同步烧结数据...' },
        { id: 10, name: '知识库', description: '知识服务', category: 'support', status: 'idle', lastActive: '10:08' },
        { id: 11, name: '运维保障', description: '运维服务', category: 'support', status: 'idle', lastActive: '10:06' },
      ];
      setAgents(mockAgents);
    } catch (error) {
      console.error('加载智能体状态失败:', error);
    } finally {
      setLoadingAgents(false);
    }
  }, []);

  // 加载数据同步状态
  const loadDataSyncStatus = useCallback(async () => {
    setLoadingSync(true);
    try {
      // 模拟数据
      const mockStatuses: DataSyncStatus[] = [
        { date: new Date().toISOString().split('T')[0], processId: 1, processName: '石灰窑', status: 'synced', autoRate: 98.5, manualCount: 0, anomalyCount: 0, lastSyncTime: '10:05' },
        { date: new Date().toISOString().split('T')[0], processId: 2, processName: '烧结', status: 'synced', autoRate: 99.2, manualCount: 1, anomalyCount: 0, lastSyncTime: '10:10' },
        { date: new Date().toISOString().split('T')[0], processId: 3, processName: '高炉', status: 'synced', autoRate: 97.8, manualCount: 0, anomalyCount: 0, lastSyncTime: '10:08' },
        { date: new Date().toISOString().split('T')[0], processId: 4, processName: '转炉', status: 'partial', autoRate: 95.0, manualCount: 2, anomalyCount: 1, lastSyncTime: '10:12' },
        { date: new Date().toISOString().split('T')[0], processId: 6, processName: '轧钢', status: 'synced', autoRate: 98.0, manualCount: 0, anomalyCount: 0, lastSyncTime: '10:09' },
      ];
      setDataStatuses(mockStatuses);
    } catch (error) {
      console.error('加载数据同步状态失败:', error);
    } finally {
      setLoadingSync(false);
    }
  }, []);

  // 初始化
  useEffect(() => {
    loadAgentStatus();
    loadDataSyncStatus();
  }, [loadAgentStatus, loadDataSyncStatus]);

  // 发送消息
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // 模拟AI响应
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 根据消息内容生成不同响应
      let responseContent = '';
      let taskProgress = undefined;

      if (message.includes('核算') || message.includes('计算')) {
        responseContent = '好的，我正在调度碳核算Agent为您进行碳排放核算。';
        taskProgress = [
          { taskId: 'task_1', agentId: 1, agentName: '石灰窑', description: '石灰窑碳排放核算', status: 'done' as const, result: { 产量_t: 258, 碳排放_tCO2: 113.5 } },
          { taskId: 'task_2', agentId: 2, agentName: '烧结', description: '烧结碳排放核算', status: 'done' as const, result: { 产量_t: 7931, 碳排放_tCO2: 3456.8 } },
          { taskId: 'task_3', agentId: 3, agentName: '高炉', description: '高炉碳排放核算', status: 'done' as const, result: { 产量_t: 4041, 碳排放_tCO2: 12456.3 } },
          { taskId: 'task_4', agentId: 4, agentName: '转炉', description: '转炉碳排放核算', status: 'working' as const },
          { taskId: 'task_6', agentId: 6, agentName: '轧钢', description: '轧钢碳排放核算', status: 'pending' as const },
        ];
      } else if (message.includes('同步') || message.includes('数据')) {
        responseContent = '正在检查各工序数据同步状态...';
        taskProgress = [
          { taskId: 'sync_1', agentId: 9, agentName: '数据采集', description: '检查石灰窑数据', status: 'done' as const, result: { 状态: '已同步', 自动采集率: '98.5%' } },
          { taskId: 'sync_2', agentId: 9, agentName: '数据采集', description: '检查烧结数据', status: 'done' as const, result: { 状态: '已同步', 自动采集率: '99.2%' } },
          { taskId: 'sync_3', agentId: 9, agentName: '数据采集', description: '检查高炉数据', status: 'done' as const, result: { 状态: '已同步', 自动采集率: '97.8%' } },
        ];
      } else if (message.includes('异常') || message.includes('告警')) {
        responseContent = '检测到以下异常需要关注：';
        taskProgress = [
          { taskId: 'alert_1', agentId: 8, agentName: '双碳合规', description: '转炉电力单耗异常', status: 'done' as const, result: { 告警级别: 'warning', 偏差: '+5.2%' } },
          { taskId: 'alert_2', agentId: 8, agentName: '双碳合规', description: '烧结焦比偏高', status: 'done' as const, result: { 告警级别: 'info', 偏差: '+2.1%' } },
        ];
      } else if (message.includes('日报') || message.includes('报告')) {
        responseContent = '正在为您生成今日碳排放简报...';
        taskProgress = [
          { taskId: 'report_1', agentId: 7, agentName: '碳核算引擎', description: '汇总各工序数据', status: 'done' as const, result: { 总排放_tCO2: 16895.6 } },
          { taskId: 'report_2', agentId: 12, agentName: '大管家', description: '生成报告', status: 'working' as const },
        ];
      } else {
        responseContent = `收到您的指令：${message}\n\n作为AI智能体大管家，我可以帮您：\n1. 核算各工序碳排放\n2. 检查数据同步状态\n3. 生成碳排放报告\n4. 分析异常告警\n5. 解答碳排放相关问题\n\n请告诉我您需要什么帮助？`;
      }

      // 添加AI响应
      const aiMessage: ChatMessage = {
        id: generateId(),
        role: 'master',
        agentId: 12,
        agentName: '大管家',
        content: responseContent,
        timestamp: new Date().toISOString(),
        taskProgress,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // 更新最近操作
      if (message.includes('核算')) {
        setRecentActions((prev) => ['daily_report', ...prev.filter((a) => a !== 'daily_report')].slice(0, 3));
      } else if (message.includes('同步')) {
        setRecentActions((prev) => ['data_sync', ...prev.filter((a) => a !== 'data_sync')].slice(0, 3));
      }

      // 更新会话ID
      if (!conversationId) {
        setConversationId(`conv_${Date.now()}`);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: '处理消息失败，请重试',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // 快捷操作
  const handleQuickAction = (actionId: string) => {
    let message = '';
    switch (actionId) {
      case 'daily_report':
        message = '请帮我生成今日碳排放简报';
        break;
      case 'data_sync':
        message = '请检查各工序今日数据同步状态';
        break;
      case 'compliance_check':
        message = '请进行合规审查，检查是否有不合规项';
        break;
      case 'alert_review':
        message = '请查看今日异常告警详情';
        break;
      case 'full_calculation':
        message = '请对5大工序进行全量碳排放核算';
        break;
      case 'sync_history':
        message = '请查看数据同步历史记录';
        break;
    }
    if (message) {
      handleSendMessage(message);
      setRecentActions((prev) => [actionId, ...prev.filter((a) => a !== actionId)].slice(0, 3));
    }
  };

  // 刷新数据同步状态
  const handleRefreshSync = () => {
    loadDataSyncStatus();
    setSnackbar({ open: true, message: '数据同步状态已刷新', severity: 'success' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', bgcolor: 'grey.100' }}>
      {/* 顶部标题栏 */}
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            冷钢碳排放AI智慧管理平台
          </Typography>
          <Chip label="控制面板" color="primary" size="small" />
          <Chip label="v2.0" size="small" variant="outlined" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<NotificationsIcon />}
            label="3条待处理"
            color="warning"
            size="small"
            onClick={() => setSnackbar({ open: true, message: '暂无新通知', severity: 'info' })}
            sx={{ cursor: 'pointer' }}
          />
          <Chip
            icon={<AccountCircleIcon />}
            label="管理员"
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>

      {/* 主内容区 */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', p: 2, gap: 2 }}>
        {/* 左侧智能体面板 */}
        <AgentSidebar
          agents={agents}
          selectedAgent={selectedAgent}
          onAgentSelect={setSelectedAgent}
        />

        {/* 中央对话区域 */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
          {/* 对话窗口 */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <MainChatWindow
              messages={messages}
              loading={loading}
              onSendMessage={handleSendMessage}
              onRefresh={() => {
                loadAgentStatus();
                loadDataSyncStatus();
              }}
              selectedAgentName={selectedAgentInfo.name || '大管家'}
            />
          </Box>

          {/* 快捷操作 */}
          <Box sx={{ flexShrink: 0 }}>
            <QuickActionsPanel
              onAction={handleQuickAction}
              disabled={loading}
              recentActions={recentActions}
            />
          </Box>

          {/* AI建议面板 */}
          <Card sx={{ flexShrink: 0 }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LightbulbIcon color="warning" fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  💡 AI智能建议
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {suggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    size="small"
                    variant="outlined"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSendMessage(suggestion)}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* 数据同步状态栏 */}
      <Box sx={{ px: 2, pb: 2 }}>
        <DataSyncStatusBar
          statuses={dataStatuses}
          loading={loadingSync}
          onRefresh={handleRefreshSync}
        />
      </Box>

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
