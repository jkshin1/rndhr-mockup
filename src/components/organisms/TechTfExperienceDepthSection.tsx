import styled from 'styled-components';
import SummaryCard from '../molecules/SummaryCard';
import MiddleJobBadge from '../atoms/MiddleJobBadge';
import RiskChip from '../molecules/RiskChip';
import { analyzeTechTfDepth } from '../../data/tfCareerAnalysis';
import type { TFTemplate } from '../../data/mockData';

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
  grid-template-columns: 160px 96px 112px 112px 112px 112px 92px;
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

  span:first-child {
    text-align: left;
  }
`;

const TRow = styled.div<{ $risk: 'high' | 'medium' | 'low' }>`
  display: grid;
  grid-template-columns: 160px 96px 112px 112px 112px 112px 92px;
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

const CenterCell = styled.span`
  display: block;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const RateCell = styled(CenterCell)<{ $strong?: boolean }>`
  color: ${({ $strong, theme }) => ($strong ? theme.colors.primary : theme.colors.textPrimary)};
`;

const YearCell = styled(CenterCell)`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

function getDepthRisk(metric: ReturnType<typeof analyzeTechTfDepth>[number]): 'high' | 'medium' | 'low' {
  if (
    metric.experiencedRate < 0.4 ||
    metric.averageTechTfYears < 1.5 ||
    metric.leaderWithTechTfCount === 0
  ) {
    return 'high';
  }

  if (
    metric.experiencedRate < 0.6 ||
    metric.recentExperiencedRate < 0.45 ||
    metric.deepExperiencedCount < 1
  ) {
    return 'medium';
  }

  return 'low';
}

export default function TechTfExperienceDepthSection({ template }: { template: TFTemplate }) {
  const metrics = analyzeTechTfDepth(template);
  const totalSamples = metrics.reduce((sum, metric) => sum + metric.sampleSize, 0);
  const totalExperienced = metrics.reduce(
    (sum, metric) => sum + Math.round(metric.experiencedRate * metric.sampleSize),
    0
  );
  const totalRecentExperienced = metrics.reduce(
    (sum, metric) => sum + Math.round(metric.recentExperiencedRate * metric.sampleSize),
    0
  );
  const totalDeepExperienced = metrics.reduce((sum, metric) => sum + metric.deepExperiencedCount, 0);
  const totalLeaderWithTechTf = metrics.reduce((sum, metric) => sum + metric.leaderWithTechTfCount, 0);
  const latestParticipationYear = metrics
    .map((metric) => metric.latestParticipationYear)
    .filter((year): year is number => year !== null)
    .sort((a, b) => b - a)[0];

  return (
    <Wrap>
      <SummaryGrid>
        <SummaryCard
          label="TF 경험자 비율"
          value={totalSamples > 0 ? `${Math.round((totalExperienced / totalSamples) * 100)}%` : '0%'}
          color="#2563eb"
        />
        <SummaryCard
          label="최근 3년 경험 비율"
          value={totalSamples > 0 ? `${Math.round((totalRecentExperienced / totalSamples) * 100)}%` : '0%'}
          color="#0ea5e9"
        />
        <SummaryCard label="심화 경험 인원" value={`${totalDeepExperienced}명`} color="#7c3aed" />
        <SummaryCard label="리더+TF 경험 인원" value={`${totalLeaderWithTechTf}명`} color="#ea580c" />
        <SummaryCard
          label="최근 참여 연도"
          value={latestParticipationYear ? `${latestParticipationYear}년` : '-'}
          color="#475569"
        />
      </SummaryGrid>

      <Table>
        <THead>
          <span>직무</span>
          <span>위험도</span>
          <span>TF 경험자 비율</span>
          <span>평균 TF 경험</span>
          <span>최근 3년 경험</span>
          <span>3년+ 심화 경험</span>
          <span>리더+TF</span>
        </THead>
        {metrics.map((metric) => {
          const risk = getDepthRisk(metric);

          return (
            <TRow key={metric.subJob} $risk={risk}>
              <SubJobCell>
                <MiddleJobBadge type={metric.middleJob} />
                <strong style={{ fontSize: 13 }}>{metric.subJob}</strong>
              </SubJobCell>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <RiskChip level={risk} />
              </div>
              <RateCell $strong>{Math.round(metric.experiencedRate * 100)}%</RateCell>
              <CenterCell>{metric.averageTechTfYears.toFixed(1)}년</CenterCell>
              <CenterCell>{Math.round(metric.recentExperiencedRate * 100)}%</CenterCell>
              <CenterCell>{metric.deepExperiencedCount}명</CenterCell>
              <YearCell>{metric.leaderWithTechTfCount}명</YearCell>
            </TRow>
          );
        })}
      </Table>
    </Wrap>
  );
}
