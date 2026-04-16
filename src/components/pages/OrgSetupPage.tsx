import { Layout } from 'antd';
import styled from 'styled-components';
import OrgSetupWizard from '../organisms/OrgSetupWizard';
import type { OrgSetupResult } from '../../data/orgSetupData';

const Content = styled(Layout.Content)`
  && {
    overflow-y: auto;
    background: ${({ theme }) => theme.colors.pageBg};
    height: 100%;
  }
`;

export default function OrgSetupPage() {
  const handleComplete = (result: OrgSetupResult) => {
    console.log('Org Setup Complete:', result);
    // TODO: 인력 추천 로직 연결
  };

  return (
    <Layout style={{ height: '100%' }}>
      <Content>
        <OrgSetupWizard onComplete={handleComplete} />
      </Content>
    </Layout>
  );
}
