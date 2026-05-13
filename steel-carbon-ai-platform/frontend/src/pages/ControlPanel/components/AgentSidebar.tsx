/**
 * 左侧智能体选择面板
 * AgentSidebar - 12智能体状态展示与选择
 */
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Chip, Typography, Divider, Badge, Collapse, IconButton } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HubIcon from '@mui/icons-material/Hub';
import FactoryIcon from '@mui/icons-material/Factory';
import BuildIcon from '@mui/icons-material/Build';
import { useState } from 'react';
import type { AgentStatus, AgentCategory } from '../types/controlPanel';
import { AGENTS } from '../types/controlPanel';

interface AgentSidebarProps {
  agents: AgentStatus[];
  selectedAgent: number;
  onAgentSelect: (agentId: number) => void;
}

const getCategoryIcon = (category: AgentCategory) => {
  switch (category) {
    case 'master':
      return <HubIcon color="primary" />;
    case 'process':
      return <FactoryIcon color="action" />;
    case 'support':
      return <BuildIcon color="action" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'idle':
      return 'default';
    case 'working':
      return 'primary';
    case 'error':
      return 'error';
    case 'offline':
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'idle':
      return '空闲';
    case 'working':
      return '工作中';
    case 'error':
      return '异常';
    case 'offline':
      return '离线';
    default:
      return status;
  }
};

export default function AgentSidebar({ agents, selectedAgent, onAgentSelect }: AgentSidebarProps) {
  const [openProcess, setOpenProcess] = useState(true);
  const [openSupport, setOpenSupport] = useState(true);

  // 构建智能体状态映射
  const agentStatusMap = new Map(agents.map(a => [a.id, a]));

  // 分类智能体
  const masterAgent = AGENTS.find(a => a.category === 'master');
  const processAgents = AGENTS.filter(a => a.category === 'process');
  const supportAgents = AGENTS.filter(a => a.category === 'support');

  // 统计工作中数量
  const workingCount = agents.filter(a => a.status === 'working').length;
  const errorCount = agents.filter(a => a.status === 'error').length;

  return (
    <Paper
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 头部 */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          AI智能体控制台
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Chip
            size="small"
            label={`工作中 ${workingCount}`}
            color={workingCount > 0 ? 'warning' : 'default'}
            sx={{ color: 'inherit', bgcolor: 'rgba(255,255,255,0.2)' }}
          />
          {errorCount > 0 && (
            <Chip
              size="small"
              label={`异常 ${errorCount}`}
              color="error"
              sx={{ color: 'inherit' }}
            />
          )}
        </Box>
      </Box>

      {/* 智能体列表 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List disablePadding>
          {/* 大管家（始终置顶） */}
          {masterAgent && (
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedAgent === masterAgent.id}
                onClick={() => onAgentSelect(masterAgent.id)}
                sx={{
                  bgcolor: selectedAgent === masterAgent.id ? 'primary.light' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Badge
                    color={getStatusColor(agentStatusMap.get(masterAgent.id)?.status || 'offline')}
                    variant="dot"
                  >
                    {getCategoryIcon('master')}
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        🤖 {masterAgent.name}
                      </Typography>
                      {selectedAgent === masterAgent.id && (
                        <Chip size="small" label="当前" color="primary" sx={{ height: 18, fontSize: 10 }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {agentStatusMap.get(masterAgent.id)?.currentTask || '统一入口'}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          )}

          <Divider sx={{ my: 1 }} />

          {/* 工序专家 */}
          <ListItemButton onClick={() => setOpenProcess(!openProcess)} sx={{ px: 2 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <FactoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="工序专家"
              secondary={`${processAgents.length}个工序`}
              primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
            />
            {openProcess ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openProcess} timeout="auto" unmountOnExit>
            <List disablePadding>
              {processAgents.map(agent => {
                const status = agentStatusMap.get(agent.id);
                return (
                  <ListItem key={agent.id} disablePadding>
                    <ListItemButton
                      selected={selectedAgent === agent.id}
                      onClick={() => onAgentSelect(agent.id)}
                      sx={{ pl: 4, bgcolor: selectedAgent === agent.id ? 'action.selected' : 'transparent' }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Badge
                          color={getStatusColor(status?.status || 'offline')}
                          variant="dot"
                        >
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'grey.400' }} />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            #{agent.id} {agent.name}
                          </Typography>
                        }
                        secondary={
                          <Chip
                            size="small"
                            label={getStatusLabel(status?.status || 'offline')}
                            color={getStatusColor(status?.status || 'offline')}
                            sx={{ height: 18, mt: 0.5, fontSize: 10 }}
                          />
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>

          <Divider sx={{ my: 1 }} />

          {/* 支撑体系 */}
          <ListItemButton onClick={() => setOpenSupport(!openSupport)} sx={{ px: 2 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <BuildIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="支撑体系"
              secondary={`${supportAgents.length}个服务`}
              primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
            />
            {openSupport ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openSupport} timeout="auto" unmountOnExit>
            <List disablePadding>
              {supportAgents.map(agent => {
                const status = agentStatusMap.get(agent.id);
                return (
                  <ListItem key={agent.id} disablePadding>
                    <ListItemButton
                      selected={selectedAgent === agent.id}
                      onClick={() => onAgentSelect(agent.id)}
                      sx={{ pl: 4, bgcolor: selectedAgent === agent.id ? 'action.selected' : 'transparent' }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Badge
                          color={getStatusColor(status?.status || 'offline')}
                          variant="dot"
                        >
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'grey.400' }} />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            #{agent.id} {agent.name}
                          </Typography>
                        }
                        secondary={
                          <Chip
                            size="small"
                            label={getStatusLabel(status?.status || 'offline')}
                            color={getStatusColor(status?.status || 'offline')}
                            sx={{ height: 18, mt: 0.5, fontSize: 10 }}
                          />
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </List>
      </Box>

      {/* 底部统计 */}
      <Box sx={{ p: 2, bgcolor: 'grey.100', borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          总计: {AGENTS.length} 个智能体
        </Typography>
      </Box>
    </Paper>
  );
}
