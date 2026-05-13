import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './styles/theme';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ActivityData from './pages/CarbonAccounting/ActivityData';
import EmissionFactor from './pages/CarbonAccounting/EmissionFactor';
import EmissionResult from './pages/CarbonAccounting/EmissionResult';
import DashboardScreen from './pages/CarbonMonitor/DashboardScreen';
import ProcessMonitor from './pages/CarbonMonitor/ProcessMonitor';
import AlertManage from './pages/CarbonMonitor/AlertManage';
import SmartQA from './pages/KnowledgeBase/SmartQA';
import PolicyRegulation from './pages/KnowledgeBase/PolicyRegulation';
import ControlPanel from './pages/ControlPanel';
import { useAuthStore } from './store/authStore';

// 路由守卫：未登录跳转登录页
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* 登录页 */}
          <Route path="/login" element={<AuthLayout />}>
            <Route index element={<Login />} />
          </Route>

          {/* 主布局（需要登录） */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* 碳核算 */}
            <Route path="carbon/activity-data" element={<ActivityData />} />
            <Route path="carbon/emission-factor" element={<EmissionFactor />} />
            <Route path="carbon/emission-result" element={<EmissionResult />} />

            {/* 碳监测 */}
            <Route path="monitor/screen" element={<DashboardScreen />} />
            <Route path="monitor/process" element={<ProcessMonitor />} />
            <Route path="monitor/alerts" element={<AlertManage />} />

            {/* 知识库 */}
            <Route path="knowledge/qa" element={<SmartQA />} />
            <Route path="knowledge/policy" element={<PolicyRegulation />} />

            {/* 控制面板 - AI智能体大管家 */}
            <Route path="control-panel" element={<ControlPanel />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
