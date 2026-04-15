import styled from 'styled-components';
import JobDistributionChart from './JobDistributionChart';
import TFCompetencyChart from './TFCompetencyChart';
import RiskAnalysisSection from './RiskAnalysisSection';
import FunctionOrgImpactSection from './FunctionOrgImpactSection';
import type { TFTemplate } from '../../data/mockData';

const Panel = styled.div`display: flex; flex-direction: column; gap: 24px;`;

const PanelHeader = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 20px 24px;
  border-left: 5px solid ${({ theme }) => theme.colors.primary};
  box-shadow: ${({ theme }) => theme.shadows.card};

  h2 { font-size: 20px; font-weight: 700; color: ${({ theme }) => theme.colors.textPrimary}; margin: 0 0 4px; }
  p  { font-size: 13px; color: ${({ theme }) => theme.colors.textMuted}; margin: 0; }
`;

const ChartsRow = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 20px;`;

const Section = styled.section`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 20px 24px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const SectionTitle = styled.h3`
  font-size: 16px; font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 4px;
`;

const SectionSub = styled.p`
  font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 16px;
`;

interface Props {
  template: TFTemplate;
}

export default function RecommendationPanel({ template }: Props) {
  return (
    <Panel>
      <PanelHeader>
        <h2>{template.name} — 배치 시뮬레이션 결과</h2>
        <p>직무 구성 현황 · 역량 Gap · 인력 배치 Risk 분석 · Function 조직 영향</p>
      </PanelHeader>

      <ChartsRow>
        <Section>
          <SectionTitle>직무 구성 현황</SectionTitle>
          <SectionSub>하위 직무별 현재 배치 인원</SectionSub>
          <JobDistributionChart template={template} compact />
        </Section>
        <Section>
          <SectionTitle>필요 역량 vs 배치 후 역량</SectionTitle>
          <SectionSub>직무별 목표 역량 대비 실제 배치 후 역량 비교</SectionSub>
          <TFCompetencyChart template={template} compact />
        </Section>
      </ChartsRow>

      <Section>
        <SectionTitle>인력 배치 Risk 점검</SectionTitle>
        <SectionSub>직무별 인원 부족 현황 및 역량 Gap 분석 · 권고 조치</SectionSub>
        <RiskAnalysisSection template={template} />
      </Section>

      <Section>
        <SectionTitle>Function 조직 영향 분석</SectionTitle>
        <SectionSub>TF 구성을 위한 Function 조직(TD · 공정) 인력 차출 영향 · 잔여 인력 및 역량 리스크 점검</SectionSub>
        <FunctionOrgImpactSection template={template} />
      </Section>
    </Panel>
  );
}
