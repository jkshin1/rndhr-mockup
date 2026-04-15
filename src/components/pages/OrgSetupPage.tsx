import { Layout } from 'antd';
import styled from 'styled-components';

const Content = styled(Layout.Content)`
  && {
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => theme.colors.pageBg};
    height: 100%;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
`;

const Icon = styled.div`font-size: 56px; line-height: 1;`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const Desc = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  line-height: 1.7;
`;

export default function OrgSetupPage() {
  return (
    <Layout style={{ height: '100%' }}>
      <Content>
        <EmptyState>
          <Icon>🏗️</Icon>
          <Title>조직 신설 인력 배치</Title>
          <Desc>
            신규 조직 신설 시 필요 인력 규모 산정 및 배치 시뮬레이션 기능이
            <br />
            준비 중입니다.
          </Desc>
        </EmptyState>
      </Content>
    </Layout>
  );
}
