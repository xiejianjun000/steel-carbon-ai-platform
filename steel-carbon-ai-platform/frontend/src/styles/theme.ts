import { createTheme } from '@mui/material/styles';

// 平台主题配置
const theme = createTheme({
  palette: {
    primary: {
      main: '#1565c0',
      light: '#5e92f3',
      dark: '#003c8f',
    },
    secondary: {
      main: '#2e7d32',
      light: '#60ad5e',
      dark: '#005005',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
      'Helvetica Neue', 'Arial', 'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

export default theme;
