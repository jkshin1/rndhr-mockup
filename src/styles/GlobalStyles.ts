import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: ${({ theme }) => theme.colors.pageBg};
    color: ${({ theme }) => theme.colors.textPrimary};
    line-height: 1.5;
  }

  /* Ant Design overrides */
  .ant-layout {
    background: ${({ theme }) => theme.colors.pageBg} !important;
  }

  .ant-layout-header {
    padding: 0 24px !important;
    line-height: normal !important;
    height: 60px !important;
  }

  .ant-menu-horizontal {
    border-bottom: none !important;
    line-height: normal !important;
  }

  /* Highcharts tooltip fix */
  .highcharts-tooltip-container {
    z-index: 9999 !important;
  }

  /* Scrollbars */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;
