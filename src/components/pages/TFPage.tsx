import { useState } from 'react';
import { Layout, Spin } from 'antd';
import styled from 'styled-components';
import TFRequestPanel from '../organisms/TFRequestPanel';
import RecommendationPanel from '../organisms/RecommendationPanel';
import { tfTemplates, generateRecommendations, type TFTemplate, type RoleRecommendation } from '../../data/mockData';

const Sider = styled(Layout.Sider)`
  && {
    background: #fff !important;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    overflow-y: auto;
    height: 100%;
  }
`;

const Content = styled(Layout.Content)`
  && {
    overflow-y: auto;
    background: ${({ theme }) => theme.colors.pageBg};
    padding: 24px;
  }
`;

const EmptyState = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
`;

const EmptyIcon = styled.div`font-size: 48px; line-height: 1;`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const EmptyDesc = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  line-height: 1.7;

  strong {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 700;
  }
`;

const LoadingWrap = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
`;

export default function TFPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TFTemplate | null>(null);
  const [activeTemplate,   setActiveTemplate]   = useState<TFTemplate | null>(null);
  const [recommendations,  setRecommendations]  = useState<RoleRecommendation[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (template: TFTemplate) => {
    setSelectedTemplate(template);
    if (activeTemplate?.id !== template.id) {
      setRecommendations(null);
      setActiveTemplate(null);
    }
  };

  const handleRecommend = (template: TFTemplate) => {
    setLoading(true);
    setRecommendations(null);
    setActiveTemplate(template);
    setTimeout(() => {
      const result = generateRecommendations(template);
      setRecommendations(result);
      setLoading(false);
    }, 1200);
  };

  return (
    <Layout style={{ height: '100%', overflow: 'hidden' }}>
      <Sider width={380}>
        <TFRequestPanel
          templates={tfTemplates}
          onSelect={handleSelect}
          onRecommend={handleRecommend}
        />
      </Sider>

      <Content>
        {loading && (
          <LoadingWrap>
            <Spin size="large" />
            <span>역량 데이터를 분석하여 최적의 인력을 추천하고 있습니다...</span>
          </LoadingWrap>
        )}

        {!loading && !recommendations && !selectedTemplate && (
          <EmptyState>
            <EmptyIcon>👥</EmptyIcon>
            <EmptyTitle>TF 유형을 선택하고 추천을 요청하세요</EmptyTitle>
            <EmptyDesc>
              구성원들의 역량, 경력, 프로젝트 이력을 분석하여
              <br />
              최적의 TF 인력 구성을 추천합니다.
            </EmptyDesc>
          </EmptyState>
        )}

        {!loading && !recommendations && selectedTemplate && (
          <EmptyState>
            <EmptyIcon>🔍</EmptyIcon>
            <EmptyTitle>{selectedTemplate.name} TF가 선택되었습니다</EmptyTitle>
            <EmptyDesc>
              좌측 하단의 <strong>인력 배치 시뮬레이션</strong> 버튼을 눌러
              <br />
              직무 구성 현황 및 역량 Gap 분석 결과를 확인하세요.
            </EmptyDesc>
          </EmptyState>
        )}

        {!loading && recommendations && activeTemplate && (
          <RecommendationPanel template={activeTemplate} />
        )}
      </Content>
    </Layout>
  );
}
