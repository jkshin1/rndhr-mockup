import { useState } from 'react';
import { Layout, ConfigProvider } from 'antd';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import AppHeader from './components/organisms/AppHeader';
import TFPage from './components/pages/TFPage';
import OrgSetupPage from './components/pages/OrgSetupPage';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { tfTemplates } from './data/mockData';

type PageType = 'tf' | 'org-setup';

const AppLayout = styled(Layout)`
  && {
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
`;

const PageLayout = styled(Layout)`
  && {
    flex: 1;
    overflow: hidden;
  }
`;

const antdTheme = {
  token: {
    colorPrimary: '#1e3a5f',
    borderRadius: 8,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', Roboto, sans-serif",
  },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('tf');
  const totalPool = tfTemplates.reduce((s, t) => s + t.totalHeadcount, 0);

  return (
    <ConfigProvider theme={antdTheme}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AppLayout>
          <AppHeader
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            tfCount={tfTemplates.length}
            totalHeadcount={totalPool}
          />
          <PageLayout>
            {currentPage === 'tf'        && <TFPage />}
            {currentPage === 'org-setup' && <OrgSetupPage />}
          </PageLayout>
        </AppLayout>
      </ThemeProvider>
    </ConfigProvider>
  );
}
