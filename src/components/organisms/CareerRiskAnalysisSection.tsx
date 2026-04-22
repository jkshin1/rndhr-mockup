import styled from 'styled-components';
import SummaryCard from '../molecules/SummaryCard';
import RiskChip from '../molecules/RiskChip';
import MiddleJobBadge from '../atoms/MiddleJobBadge';
import { analyzeTemplateCareer, type TFCareerMetric } from '../../data/tfCareerAnalysis';
import type { TFTemplate } from '../../data/mockData';

type CareerAction = TFCareerMetric['actions'][number];

const ACTION_STYLES: Record<CareerAction, { bg: string; border: string; color: string }> = {
  '경력직 보강': { bg: '#fef2f2', border: '#fecaca', color: '#be123c' },
  'Tech TF 경험자 우선 차출': { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
  '리더 경력 보강': { bg: '#fff7ed', border: '#fed7aa', color: '#c2410c' },
  '현 수준 유지': { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
};

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
`;

const Table = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const THead = styled.div`
  display: grid;
  grid-template-columns: 160px 88px 96px 96px 90px 90px 120px 1fr;
  padding: 10px 16px;
  background: #f8fafc;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;

  span {
    text-align: center;
  }

  span:first-child,
  span:last-child {
    text-align: left;
  }
`;

const TRow = styled.div<{ $risk: 'high' | 'medium' | 'low' }>`
  display: grid;
  grid-template-columns: 160px 88px 96px 96px 90px 90px 120px 1fr;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-left: 4px solid ${({ theme, $risk }) => theme.colors.risk[$risk].dot};
  background: ${({ theme, $risk }) => theme.colors.risk[$risk].bg};
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const SubJobCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NumCell = styled.span`
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  display: block;
`;

const GapCell = styled.span<{ $neg: boolean }>`
  text-align: center;
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: ${({ $neg, theme }) => ($neg ? theme.colors.risk.high.text : theme.colors.risk.low.text)};
`;

const LeaderCell = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
`;

const LeaderTag = styled.span`
  padding: 2px 7px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;
  font-weight: 600;
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const ActionTag = styled.span<{ $action: CareerAction }>`
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid ${({ $action }) => ACTION_STYLES[$action].border};
  background: ${({ $action }) => ACTION_STYLES[$action].bg};
  color: ${({ $action }) => ACTION_STYLES[$action].color};
  font-size: 12px;
  font-weight: 600;
`;

const ActionCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ActionCard = styled.div<{ $variant: 'hire' | 'tf' | 'leader' }>`
  display: flex;
  gap: 14px;
  border-radius: 10px;
  padding: 16px 18px;
  border: 1px solid
    ${({ $variant }) =>
      $variant === 'hire' ? '#fecaca' : $variant === 'tf' ? '#bfdbfe' : '#fed7aa'};
  border-left: 4px solid
    ${({ $variant }) =>
      $variant === 'hire' ? '#ef4444' : $variant === 'tf' ? '#3b82f6' : '#f97316'};
  background: ${({ $variant }) =>
    $variant === 'hire' ? '#fff1f2' : $variant === 'tf' ? '#eff6ff' : '#fff7ed'};
`;

const ActionCardIcon = styled.div`
  font-size: 26px;
  line-height: 1;
`;

const ActionCardBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionCardTitle = styled.div<{ $variant: 'hire' | 'tf' | 'leader' }>`
  font-size: 15px;
  font-weight: 700;
  color: ${({ $variant }) =>
    $variant === 'hire' ? '#7f1d1d' : $variant === 'tf' ? '#1e3a5f' : '#9a3412'};
`;

const ActionCardDesc = styled.div`
  font-size: 13px;
  color: #475569;

  strong {
    font-weight: 700;
  }
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
`;

const JobTag = styled.span<{ $variant: 'hire' | 'tf' | 'leader' }>`
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: #fff;
  border: 1px solid
    ${({ $variant }) =>
      $variant === 'hire' ? '#fecaca' : $variant === 'tf' ? '#bfdbfe' : '#fed7aa'};
  color: ${({ $variant }) =>
    $variant === 'hire' ? '#be123c' : $variant === 'tf' ? '#1d4ed8' : '#c2410c'};
`;

export default function CareerRiskAnalysisSection({ template }: { template: TFTemplate }) {
  const metrics = analyzeTemplateCareer(template);
  const highItems = metrics.filter((item) => item.riskLevel === 'high');
  const mediumItems = metrics.filter((item) => item.riskLevel === 'medium');
  const lowItems = metrics.filter((item) => item.riskLevel === 'low');
  const careerGapItems = metrics.filter((item) => item.actions.includes('경력직 보강'));
  const tfGapItems = metrics.filter((item) => item.actions.includes('Tech TF 경험자 우선 차출'));
  const leaderGapItems = metrics.filter((item) => item.actions.includes('리더 경력 보강'));
  const avgCareerGap =
    metrics.length > 0
      ? metrics.reduce((sum, item) => sum + item.careerGap, 0) / metrics.length
      : 0;

  return (
    <Wrap>
      <SummaryGrid>
        <SummaryCard label="고위험 직무" value={`${highItems.length}`} color="#ef4444" />
        <SummaryCard label="중위험 직무" value={`${mediumItems.length}`} color="#f59e0b" />
        <SummaryCard label="저위험 직무" value={`${lowItems.length}`} color="#22c55e" />
        <SummaryCard label="평균 경력 Gap" value={`${avgCareerGap.toFixed(1)}년`} color="#2563eb" />
        <SummaryCard label="Tech TF 경험 부족" value={`${tfGapItems.length}개`} color="#0ea5e9" />
      </SummaryGrid>

      <Table>
        <THead>
          <span>직무</span>
          <span style={{ textAlign: 'center' }}>위험도</span>
          <span style={{ textAlign: 'center' }}>배치 평균 경력</span>
          <span style={{ textAlign: 'center' }}>요구 평균 경력</span>
          <span style={{ textAlign: 'center' }}>경력 Gap</span>
          <span style={{ textAlign: 'center' }}>TF 경험</span>
          <span style={{ textAlign: 'center' }}>리더 경험</span>
          <span>권고 조치</span>
        </THead>
        {metrics.map((item) => (
          <TRow key={item.subJob} $risk={item.riskLevel}>
            <SubJobCell>
              <MiddleJobBadge type={item.middleJob} />
              <strong style={{ fontSize: 13 }}>{item.subJob}</strong>
            </SubJobCell>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RiskChip level={item.riskLevel} />
            </div>
            <NumCell>{item.actualAvgCareerYears.toFixed(1)}년</NumCell>
            <NumCell>{item.requiredAvgCareerYears.toFixed(1)}년</NumCell>
            <GapCell $neg={item.careerGap > 0}>
              {item.careerGap > 0 ? `▼ ${item.careerGap.toFixed(1)}년` : '✓'}
            </GapCell>
            <GapCell $neg={item.techTfRateGap > 0}>
              {Math.round(item.techTfExperiencedRate * 100)}%
            </GapCell>
            <LeaderCell>
              <LeaderTag>팀 {item.teamLeadExperiencedCount}</LeaderTag>
              <LeaderTag>Part {item.partLeadExperiencedCount}</LeaderTag>
              <LeaderTag>Mod {item.moduleLeadExperiencedCount}</LeaderTag>
            </LeaderCell>
            <ActionsCell>
              {item.actions.map((action) => (
                <ActionTag key={`${item.subJob}-${action}`} $action={action}>
                  {action}
                </ActionTag>
              ))}
            </ActionsCell>
          </TRow>
        ))}
      </Table>

      <ActionCards>
        {careerGapItems.length > 0 && (
          <ActionCard $variant="hire">
            <ActionCardIcon>👤</ActionCardIcon>
            <ActionCardBody>
              <ActionCardTitle $variant="hire">경력직 보강 필요</ActionCardTitle>
              <ActionCardDesc>
                <strong>{careerGapItems.length}개 직무</strong>에서 요구 평균 경력 대비 부족이 확인되었습니다.
              </ActionCardDesc>
              <TagList>
                {careerGapItems.map((item) => (
                  <JobTag key={item.subJob} $variant="hire">
                    {item.subJob} ({item.careerGap.toFixed(1)}년)
                  </JobTag>
                ))}
              </TagList>
            </ActionCardBody>
          </ActionCard>
        )}

        {tfGapItems.length > 0 && (
          <ActionCard $variant="tf">
            <ActionCardIcon>🧭</ActionCardIcon>
            <ActionCardBody>
              <ActionCardTitle $variant="tf">Tech TF 경험자 우선 차출</ActionCardTitle>
              <ActionCardDesc>
                <strong>{tfGapItems.length}개 직무</strong>에서 이전 Tech TF 경험자 비중이 요구 수준에 못 미칩니다.
              </ActionCardDesc>
              <TagList>
                {tfGapItems.map((item) => (
                  <JobTag key={item.subJob} $variant="tf">
                    {item.subJob} ({Math.round(item.techTfExperiencedRate * 100)}%)
                  </JobTag>
                ))}
              </TagList>
            </ActionCardBody>
          </ActionCard>
        )}

        {leaderGapItems.length > 0 && (
          <ActionCard $variant="leader">
            <ActionCardIcon>🎯</ActionCardIcon>
            <ActionCardBody>
              <ActionCardTitle $variant="leader">리더 경력 보강 필요</ActionCardTitle>
              <ActionCardDesc>
                팀장, Part장, Module장 경험자를 추가 확보해 초기 운영 안정성을 높일 필요가 있습니다.
              </ActionCardDesc>
              <TagList>
                {leaderGapItems.map((item) => (
                  <JobTag key={item.subJob} $variant="leader">
                    {item.subJob} ({item.leadershipExperiencedCount}/{item.requiredLeadershipCount})
                  </JobTag>
                ))}
              </TagList>
            </ActionCardBody>
          </ActionCard>
        )}
      </ActionCards>
    </Wrap>
  );
}
