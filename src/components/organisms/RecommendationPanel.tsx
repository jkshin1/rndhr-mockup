import styled from 'styled-components';
import ResultConditionEditorSection from './ResultConditionEditorSection';
import TFSpecialContextSection from './TFSpecialContextSection';
import JobDistributionChart from './JobDistributionChart';
import TFCareerChart from './TFCareerChart';
import CareerDistributionSection from './CareerDistributionSection';
import CareerRiskAnalysisSection from './CareerRiskAnalysisSection';
import FunctionOrgCareerImpactSection from './FunctionOrgCareerImpactSection';
import { getTemplateSpecialFactors, type TFTemplate } from '../../data/mockData';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const PanelHeader = styled.div`
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 45%, #f9f5ff 100%);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 22px 24px;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  box-shadow: ${({ theme }) => theme.shadows.card};

  h2 {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.4;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0 0 6px;
  }

  p {
    font-size: 14px;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.textMuted};
    margin: 0;
  }
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 18px 20px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const SectionTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 6px;
`;

const SectionSub = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.6;
  margin: 0 0 16px;
  max-width: 78ch;
`;

const SectionBody = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 14px;
`;

interface Props {
  template: TFTemplate;
  loading?: boolean;
  onRerun: (template: TFTemplate) => void;
}

export default function RecommendationPanel({ template, loading = false, onRerun }: Props) {
  const specialFactors = getTemplateSpecialFactors(template);
  const specialContextText = specialFactors.platformUndecided
    ? 'Adhara 이후 구간의 차기 Tech Platform 미정 상태와 신규 요소기술 셋업 비중을 반영한 추가 인력·경력 가중'
    : `${specialFactors.platformSeries} 기준 주요 적용 사항과 신규 요소기술 셋업 비중을 반영한 추가 인력·경력 가중`;

  return (
    <Panel>
      <PanelHeader>
        <h2>{template.name} — 배치 시뮬레이션 결과</h2>
        <p>직무 구성 현황 · 평균 경력 · 적용 Tech Platform/신규 요소기술 셋업 영향 · CL 분포 · Function 조직 영향</p>
      </PanelHeader>

      <Section>
        <SectionTitle>직무 별 인력 구성</SectionTitle>
        <SectionSub>직무별 구성원 수, 직급별 평균 경력, 평균 TF경험 햇수를 수정한 뒤 같은 화면에서 재시뮬레이션</SectionSub>
        <SectionBody>
          <ResultConditionEditorSection template={template} loading={loading} onRerun={onRerun} />
        </SectionBody>
      </Section>

      <Section>
        <SectionTitle>적용 Tech Platform · 신규 요소기술 셋업 영향</SectionTitle>
        <SectionSub>{specialContextText}</SectionSub>
        <SectionBody>
          <TFSpecialContextSection template={template} />
        </SectionBody>
      </Section>

      <ChartsRow>
        <Section>
          <SectionTitle>직무 구성 현황</SectionTitle>
          <SectionSub>하위 직무별 현재 배치 인원</SectionSub>
          <SectionBody>
            <JobDistributionChart template={template} compact />
          </SectionBody>
        </Section>
        <Section>
          <SectionTitle>요구 평균 경력 vs 배치 평균 경력</SectionTitle>
          <SectionSub>직무별 평균 경력, 이전 Tech TF 경험, 리더 경력, 적용 Tech Platform과 신규 요소기술 셋업 가중 반영 결과 비교</SectionSub>
          <SectionBody>
            <TFCareerChart template={template} compact />
          </SectionBody>
        </Section>
      </ChartsRow>

      <Section>
        <SectionTitle>CL2~CL5 경력 분포</SectionTitle>
        <SectionSub>직무별 배치 인원의 직급 분포와 평균 경력 수준 비교</SectionSub>
        <SectionBody>
          <CareerDistributionSection template={template} />
        </SectionBody>
      </Section>

      <Section>
        <SectionTitle>인력 배치 경력 Risk 점검</SectionTitle>
        <SectionSub>직무별 평균 경력, 이전 Tech TF 경험, 팀장/Part장/Module장 경력과 적용 Tech Platform/신규 요소기술 셋업 가중 기준 분석</SectionSub>
        <SectionBody>
          <CareerRiskAnalysisSection template={template} />
        </SectionBody>
      </Section>

      <Section>
        <SectionTitle>Function 조직 경력 영향 분석</SectionTitle>
        <SectionSub>TF 구성을 위한 Function 조직(TD · 공정) 인력 차출 영향 · 잔여 인력 및 평균 경력 리스크 점검 · 적용 Tech Platform/신규 요소기술 셋업 영향 반영</SectionSub>
        <SectionBody>
          <FunctionOrgCareerImpactSection template={template} />
        </SectionBody>
      </Section>
    </Panel>
  );
}
