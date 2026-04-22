import styled from 'styled-components';
import SummaryCard from '../molecules/SummaryCard';
import MiddleJobBadge from '../atoms/MiddleJobBadge';
import { analyzeCareerDistribution, type CareerLevel } from '../../data/tfCareerAnalysis';
import type { TFTemplate } from '../../data/mockData';

const CL_ORDER: CareerLevel[] = ['CL2', 'CL3', 'CL4', 'CL5'];
const CL_META: Record<CareerLevel, { color: string; bg: string; border: string }> = {
  CL2: { color: '#0f766e', bg: '#ecfeff', border: '#99f6e4' },
  CL3: { color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  CL4: { color: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
  CL5: { color: '#7e22ce', bg: '#fdf4ff', border: '#e9d5ff' },
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
  grid-template-columns: 160px 1fr 120px 96px;
  padding: 10px 16px;
  background: #f8fafc;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const TRow = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr 120px 96px;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
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

const DistributionCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DistributionBar = styled.div`
  display: flex;
  width: 100%;
  height: 14px;
  border-radius: 999px;
  overflow: hidden;
  background: #eef2f7;
`;

const DistributionSegment = styled.div<{ $level: CareerLevel; $ratio: number }>`
  width: ${({ $ratio }) => `${$ratio * 100}%`};
  min-width: ${({ $ratio }) => ($ratio > 0 ? '6px' : '0')};
  background: ${({ $level }) => CL_META[$level].color};
`;

const DistributionLegend = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const CLTag = styled.span<{ $level: CareerLevel }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid ${({ $level }) => CL_META[$level].border};
  background: ${({ $level }) => CL_META[$level].bg};
  color: ${({ $level }) => CL_META[$level].color};
  font-size: 11px;
  font-weight: 700;
`;

const DominantBadge = styled.span<{ $level: CareerLevel }>`
  justify-self: center;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid ${({ $level }) => CL_META[$level].border};
  background: ${({ $level }) => CL_META[$level].bg};
  color: ${({ $level }) => CL_META[$level].color};
  font-size: 12px;
  font-weight: 700;
`;

const AvgCell = styled.span`
  justify-self: center;
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export default function CareerDistributionSection({ template }: { template: TFTemplate }) {
  const metrics = analyzeCareerDistribution(template);
  const totalSamples = metrics.reduce((sum, metric) => sum + metric.sampleSize, 0);
  const totalClCounts = metrics.reduce(
    (acc, metric) => {
      CL_ORDER.forEach((level) => {
        acc[level] += metric.clCounts[level];
      });
      return acc;
    },
    { CL2: 0, CL3: 0, CL4: 0, CL5: 0 }
  );

  return (
    <Wrap>
      <SummaryGrid>
        {CL_ORDER.map((level) => (
          <SummaryCard
            key={level}
            label={`${level} 분포`}
            value={totalSamples > 0 ? `${Math.round((totalClCounts[level] / totalSamples) * 100)}%` : '0%'}
            color={CL_META[level].color}
          />
        ))}
        <SummaryCard label="표본 인원" value={`${totalSamples}명`} color="#475569" />
      </SummaryGrid>

      <Table>
        <THead>
          <span>직무</span>
          <span>CL2~CL5 분포</span>
          <span style={{ textAlign: 'center' }}>주력 CL</span>
          <span style={{ textAlign: 'center' }}>배치 평균 경력</span>
        </THead>
        {metrics.map((metric) => (
          <TRow key={metric.subJob}>
            <SubJobCell>
              <MiddleJobBadge type={metric.middleJob} />
              <strong style={{ fontSize: 13 }}>{metric.subJob}</strong>
            </SubJobCell>
            <DistributionCell>
              <DistributionBar>
                {CL_ORDER.map((level) => (
                  <DistributionSegment
                    key={`${metric.subJob}-${level}`}
                    $level={level}
                    $ratio={metric.clRatios[level]}
                  />
                ))}
              </DistributionBar>
              <DistributionLegend>
                {CL_ORDER.map((level) => (
                  <CLTag key={`${metric.subJob}-tag-${level}`} $level={level}>
                    {level} {metric.clCounts[level]}명
                  </CLTag>
                ))}
              </DistributionLegend>
            </DistributionCell>
            <DominantBadge $level={metric.dominantLevel}>{metric.dominantLevel}</DominantBadge>
            <AvgCell>{metric.actualAvgCareerYears.toFixed(1)}년</AvgCell>
          </TRow>
        ))}
      </Table>
    </Wrap>
  );
}
