import styled from 'styled-components';
import SummaryCard from '../molecules/SummaryCard';
import RiskChip from '../molecules/RiskChip';
import MiddleJobBadge from '../atoms/MiddleJobBadge';
import { analyzeTemplateSpecialContext } from '../../data/tfCareerAnalysis';
import type { TFTemplate } from '../../data/mockData';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
`;

const ContextCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid #bfdbfe;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
`;

const ContextTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const ContextTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    font-size: 16px;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  span {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ContextText = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.7;

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Table = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const THead = styled.div`
  display: grid;
  grid-template-columns: 180px 112px 112px 112px 116px;
  padding: 10px 16px;
  background: #f8fafc;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
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

const TRow = styled.div`
  display: grid;
  grid-template-columns: 180px 112px 112px 112px 116px;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const JobCell = styled.div`
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

export default function TFSpecialContextSection({ template }: { template: TFTemplate }) {
  const summary = analyzeTemplateSpecialContext(template);
  const focusValue = summary.platformUndecided
    ? '차기 Platform 미정'
    : summary.platformKeyFocus ?? summary.platformStageLabel;
  const contextLabel = summary.platformContextLabel ?? `${summary.platformSeries} ${summary.platformStageLabel}`;
  const undecidedContextText =
    summary.platformContextLabel && summary.platformContextLabel.includes('Adhara 이후')
      ? 'Adhara 이후 구간'
      : contextLabel;

  return (
    <Wrap>
      <SummaryGrid>
        <SummaryCard label="적용 Platform" value={summary.platformSeries} color="#2563eb" />
        <SummaryCard
          label={summary.platformUndecided ? 'Platform 상태' : '주요 적용 사항'}
          value={focusValue}
          color="#7c3aed"
        />
        <SummaryCard
          label="평균 추가 경력 요구"
          value={`+${summary.averageAdditionalCareerYears.toFixed(1)}년`}
          color="#ea580c"
        />
        <SummaryCard label="추가 리더 보강 직무" value={`${summary.leadershipPremiumJobs}개`} color="#ef4444" />
      </SummaryGrid>

      <ContextCard>
        <ContextTop>
          <ContextTitle>
            <strong>{summary.platformSeries}</strong>
            <span>{contextLabel}</span>
          </ContextTitle>
          <RiskChip level={summary.nuddLevel} />
        </ContextTop>
        <ContextText>
          {summary.platformUndecided ? (
            <>
              현재 TF는 <strong>{undecidedContextText}</strong>으로, 차기 Tech Platform이 아직 확정되지 않은
              상태를 기준으로 분석했습니다. 신규 요소기술 셋업 비중 <strong>{Math.round(summary.nuddRatio * 100)}%</strong>를
              중심으로 추가 인력/경력 요구를 산정했고, 실제 Platform 방향이 확정되면 해당 가중은 다시 조정될 수 있습니다.
            </>
          ) : (
            <>
              현재 TF는 <strong>{summary.platformSeries}</strong>의 <strong>{summary.platformStageLabel}</strong>
              입니다. 분석 기준 구간은 <strong>{contextLabel}</strong>이며,
              {summary.platformKeyFocus ? (
                <>
                  {' '}주요 적용 사항은 <strong>{summary.platformKeyFocus}</strong>입니다.
                </>
              ) : null}{' '}
              신규 요소기술 셋업 비중 <strong>{Math.round(summary.nuddRatio * 100)}%</strong>를 요구 평균 경력,
              추가 숙련 인력 필요 수준, 리더 요구 수에 가중으로 반영합니다.
            </>
          )}
          {summary.isNewPlatformIntroduction &&
            ' 신규 Platform 최초 적용 구간이라 공정/통합 직무의 요구치가 추가 상향됩니다.'}
        </ContextText>
      </ContextCard>

      <Table>
        <THead>
          <span>직무</span>
          <span>Tech Platform 가중</span>
          <span>신규 요소기술 가중</span>
          <span>추가 경력 요구</span>
          <span>추가 숙련 인력 요구</span>
        </THead>
        {summary.impactedJobs.map((item) => (
          <TRow key={item.subJob}>
            <JobCell>
              <MiddleJobBadge type={item.middleJob} />
              <strong style={{ fontSize: 14 }}>{item.subJob}</strong>
            </JobCell>
            <CenterCell>+{item.platformAdjustmentYears.toFixed(1)}년</CenterCell>
            <CenterCell>+{item.nuddAdjustmentYears.toFixed(1)}년</CenterCell>
            <CenterCell>+{item.totalAdjustmentYears.toFixed(1)}년</CenterCell>
            <CenterCell>+{Math.round(item.additionalTechTfRate * 100)}%p</CenterCell>
          </TRow>
        ))}
      </Table>
    </Wrap>
  );
}
