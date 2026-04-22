import styled from 'styled-components';
import SummaryCard from '../molecules/SummaryCard';
import MiddleJobBadge from '../atoms/MiddleJobBadge';
import RiskChip from '../molecules/RiskChip';
import type { DamDangRisk } from '../../data/orgSetupSimulation';
import type { OrgMiddleJob } from '../../data/orgSetupData';

type RiskLevel = 'high' | 'medium' | 'low';

/* ── Layout ── */
const Wrap = styled.div`display: flex; flex-direction: column; gap: 16px;`;
const SummaryGrid = styled.div`display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;`;

/* ── Bars panel ── */
const BarsPanel = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 18px 22px;
  display: flex; flex-direction: column; gap: 4px;
`;

const Legend = styled.div`
  display: flex; gap: 22px; font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding-bottom: 14px; margin-bottom: 10px;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};

  span { display: inline-flex; align-items: center; gap: 6px; }
`;
const LegendBox = styled.i<{ $variant: 'remain' | 'pulled' | 'min' }>`
  display: inline-block;
  width: ${({ $variant }) => $variant === 'min' ? '2px' : '14px'};
  height: ${({ $variant }) => $variant === 'min' ? '14px' : '10px'};
  border-radius: ${({ $variant }) => $variant === 'min' ? '0' : '2px'};
  background: ${({ $variant }) =>
    $variant === 'remain' ? 'linear-gradient(90deg,#22c55e,#f59e0b,#ef4444)' :
    $variant === 'pulled' ? '#64748b' : '#0f172a'};
`;

/* ── Single bar row ── */
const BarRow = styled.div`
  display: grid;
  grid-template-columns: 180px 1fr 240px;
  gap: 16px; align-items: center;
  padding: 14px 0 10px;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.borderLight};
  &:last-child { border-bottom: none; }
`;

const RowLabel = styled.div`display: flex; flex-direction: column; gap: 4px;`;
const RowLabelName = styled.strong`font-size: 14px; color: ${({ theme }) => theme.colors.textPrimary};`;
const TeamSub = styled.span`font-size: 10px; color: ${({ theme }) => theme.colors.textMuted};`;

const BarArea = styled.div`position: relative; height: 30px; margin-top: 14px;`;
const BarTrack = styled.div`position: absolute; inset: 0; display: flex; border-radius: 6px; overflow: hidden; background: #f1f5f9;`;

const RemainBar = styled.div<{ $risk: RiskLevel; $pct: number }>`
  width: ${({ $pct }) => $pct}%;
  display: flex; align-items: center; justify-content: flex-end; padding-right: 10px;
  color: #fff; font-size: 12px; font-weight: 700; transition: width 0.4s ease;
  background: ${({ $risk }) =>
    $risk === 'low' ? 'linear-gradient(90deg,#16a34a,#22c55e)' :
    $risk === 'medium' ? 'linear-gradient(90deg,#d97706,#f59e0b)' :
    'linear-gradient(90deg,#dc2626,#ef4444)'};
`;

const PulledBar = styled.div<{ $pct: number }>`
  width: ${({ $pct }) => $pct}%;
  background: repeating-linear-gradient(135deg,#64748b,#64748b 6px,#475569 6px,#475569 12px);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 11px; font-weight: 700;
`;

const MinLine = styled.div<{ $pct: number }>`
  position: absolute; top: -6px; bottom: -6px; width: 2px;
  left: ${({ $pct }) => $pct}%;
  background: #0f172a; z-index: 2;
  &::before { content: ''; position: absolute; top: 0; left: -3px; width: 8px; height: 3px; background: #0f172a; }
`;
const MinLabel = styled.span`
  position: absolute; top: -18px; left: 50%; transform: translateX(-50%);
  font-size: 10px; font-weight: 700; color: #0f172a; white-space: nowrap;
  background: #fff; padding: 0 4px;
`;

const Stats = styled.div`display: flex; flex-direction: column; gap: 3px; font-size: 12px;`;
const FlowRow = styled.div`display: flex; align-items: baseline; gap: 6px; font-size: 13px; color: #475569;
  strong { color: #0f172a; font-size: 15px; font-weight: 700; }
  .arrow { color: #94a3b8; }
  .delta { font-size: 11px; color: #64748b; }
`;
const GapRow = styled.div<{ $risk: RiskLevel }>`
  font-weight: 700; font-size: 12px;
  color: ${({ theme, $risk }) => theme.colors.risk[$risk].text};
`;
const TeamRow = styled.div`
  color: #64748b; font-size: 11px; display: flex; flex-wrap: wrap; gap: 4px; align-items: center;
  em { font-style: normal; font-weight: 700; color: #475569; }
`;

/* ── Action cards ── */
const ActionsWrap = styled.div`display: flex; flex-direction: column; gap: 10px;`;
const ActionCard = styled.div<{ $variant: 'high' | 'medium' }>`
  display: flex; gap: 14px; border-radius: 10px; padding: 16px 18px; border: 1px solid; border-left: 4px solid;
  background: ${({ $variant }) => $variant === 'high' ? '#fff1f2' : '#fffbeb'};
  border-color: ${({ $variant }) => $variant === 'high' ? '#fecdd3' : '#fde68a'};
  border-left-color: ${({ $variant }) => $variant === 'high' ? '#ef4444' : '#f59e0b'};
`;
const Icon = styled.div`font-size: 26px;`;
const CardBody = styled.div`flex: 1; display: flex; flex-direction: column; gap: 8px;`;
const CardTitle = styled.div<{ $variant: 'high' | 'medium' }>`
  font-size: 15px; font-weight: 700;
  color: ${({ $variant }) => $variant === 'high' ? '#7f1d1d' : '#78350f'};
`;
const CardDesc = styled.div`font-size: 13px; color: #475569;
  strong { color: inherit; font-weight: 700; }`;
const TagList = styled.div`display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;`;
const ItemRow = styled.div`
  display: flex; align-items: flex-start; gap: 10px;
  padding: 8px 10px; background: #fff; border: 1px solid #fecdd3; border-radius: 6px;
`;
const ItemTag = styled.span`font-size: 12px; color: #7f1d1d; white-space: nowrap;
  strong { color: #be123c; }`;
const ItemMsg = styled.span`color: #475569; font-size: 12px; flex: 1; line-height: 1.5;`;
const MediumTag = styled.span`
  background: #fff; border: 1px solid #fde68a; color: #78350f;
  padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
`;

interface Props {
  damDangRisks: DamDangRisk[];
  middleJob: OrgMiddleJob;
}

export default function OrgFunctionImpactSection({ damDangRisks, middleJob }: Props) {
  if (damDangRisks.length === 0) {
    return (
      <Wrap>
        <div style={{ padding: 20, color: '#94a3b8', fontSize: 13 }}>
          Function 조직 영향 데이터가 없습니다.
        </div>
      </Wrap>
    );
  }

  const totalPulled = damDangRisks.reduce((s, d) => s + d.totalPulled, 0);
  const totalCurrent = damDangRisks.reduce((s, d) => s + d.totalCurrentHeadcount, 0);
  const totalRemaining = damDangRisks.reduce((s, d) => s + d.totalRemaining, 0);
  const highItems = damDangRisks.filter((d) => d.riskLevel === 'high');
  const mediumItems = damDangRisks.filter((d) => d.riskLevel === 'medium');
  const maxOriginal = Math.max(...damDangRisks.map((d) => d.totalCurrentHeadcount));
  const pct = (n: number) => (n / maxOriginal) * 100;

  return (
    <Wrap>
      <SummaryGrid>
        <SummaryCard label="총 차출 인력"    value={`${totalPulled}명`}         color="#6366f1" />
        <SummaryCard label="영향 담당 조직"  value={`${damDangRisks.length}개`} color="#2563eb" />
        <SummaryCard label="잔여 인력"       value={`${totalRemaining}명`}      color="#16a34a" />
        <SummaryCard label="고위험 담당"     value={`${highItems.length}개`}    color="#ef4444" />
        <SummaryCard label="중위험 담당"     value={`${mediumItems.length}개`}  color="#f59e0b" />
      </SummaryGrid>

      <BarsPanel>
        <Legend>
          <span><LegendBox $variant="remain" />잔여 인력</span>
          <span><LegendBox $variant="pulled" />신설 조직 차출</span>
          <span><LegendBox $variant="min" />최소 필요 인력</span>
        </Legend>
        {damDangRisks.map((dd) => {
          const shortage = Math.max(0, dd.minimumRequired - dd.totalRemaining);
          const margin = dd.totalRemaining - dd.minimumRequired;
          return (
            <BarRow key={dd.damDangName}>
              <RowLabel>
                <MiddleJobBadge type={middleJob} />
                <RowLabelName>{dd.damDangName}</RowLabelName>
                <RiskChip level={dd.riskLevel} />
                <TeamSub>하위 팀 {dd.teams.length}개</TeamSub>
              </RowLabel>
              <BarArea>
                <BarTrack>
                  <RemainBar $risk={dd.riskLevel} $pct={pct(dd.totalRemaining)}>
                    {pct(dd.totalRemaining) > 10 && <span>{dd.totalRemaining}</span>}
                  </RemainBar>
                  <PulledBar $pct={pct(dd.totalPulled)}>
                    {pct(dd.totalPulled) > 6 && <span>−{dd.totalPulled}</span>}
                  </PulledBar>
                </BarTrack>
                <MinLine $pct={pct(dd.minimumRequired)}>
                  <MinLabel>min {dd.minimumRequired}</MinLabel>
                </MinLine>
              </BarArea>
              <Stats>
                <FlowRow>
                  <span>{dd.totalCurrentHeadcount}명</span>
                  <span className="arrow">→</span>
                  <strong>{dd.totalRemaining}명</strong>
                  <span className="delta">(−{dd.totalPulled})</span>
                </FlowRow>
                <GapRow $risk={dd.riskLevel}>
                  {shortage > 0 ? `▼ 최소 기준 ${shortage}명 부족` : `✓ ${margin}명 여유`}
                </GapRow>
                <TeamRow>
                  <em>영향 팀:</em>
                  {dd.teams.slice(0, 3).map((t) => (
                    <span key={t.teamName}>{t.teamName}</span>
                  ))}
                  {dd.teams.length > 3 && <span>외 {dd.teams.length - 3}</span>}
                </TeamRow>
              </Stats>
            </BarRow>
          );
        })}
      </BarsPanel>

      {(highItems.length > 0 || mediumItems.length > 0) && (
        <ActionsWrap>
          {highItems.length > 0 && (
            <ActionCard $variant="high">
              <Icon>⚠️</Icon>
              <CardBody>
                <CardTitle $variant="high">Function 조직 고위험 발생</CardTitle>
                <CardDesc>
                  <strong>{highItems.length}개 담당</strong>에서 최소 운영 기준 미달 · 신설 조직 차출 규모 재검토 필요
                </CardDesc>
                <TagList>
                  {highItems.map((i) => {
                    const shortage = Math.max(0, i.minimumRequired - i.totalRemaining);
                    return (
                      <ItemRow key={i.damDangName}>
                        <ItemTag>{middleJob} · <strong>{i.damDangName}</strong></ItemTag>
                        <ItemMsg>
                          {shortage > 0
                            ? `잔여 ${i.totalRemaining}명 (최소 ${i.minimumRequired}명) · ${shortage}명 충원 또는 차출 축소 검토`
                            : `차출 규모 ${i.totalPulled}명 · 핵심 인력 집중 손실로 운영 리스크 발생`}
                        </ItemMsg>
                      </ItemRow>
                    );
                  })}
                </TagList>
              </CardBody>
            </ActionCard>
          )}
          {mediumItems.length > 0 && (
            <ActionCard $variant="medium">
              <Icon>📌</Icon>
              <CardBody>
                <CardTitle $variant="medium">Function 조직 모니터링 필요</CardTitle>
                <CardDesc>
                  <strong>{mediumItems.length}개 담당</strong>이 최소 운영 기준에 근접 · 추가 차출 시 리스크 전환 가능
                </CardDesc>
                <TagList>
                  {mediumItems.map((i) => {
                    const margin = i.totalRemaining - i.minimumRequired;
                    return (
                      <MediumTag key={i.damDangName}>
                        {i.damDangName} (차출 {i.totalPulled}명 · 여유 {margin}명)
                      </MediumTag>
                    );
                  })}
                </TagList>
              </CardBody>
            </ActionCard>
          )}
        </ActionsWrap>
      )}

      <div style={{
        padding: '10px 14px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        fontSize: 12,
        color: '#64748b',
        lineHeight: 1.6,
      }}>
        현재 인원 <strong style={{ color: '#0f172a' }}>{totalCurrent}명</strong>에서
        <strong style={{ color: '#be123c' }}> −{totalPulled}명</strong> 차출 →
        <strong style={{ color: '#0f172a' }}> 잔여 {totalRemaining}명</strong>
        {' · '}
        차출률 <strong>{totalCurrent > 0 ? ((totalPulled / totalCurrent) * 100).toFixed(1) : 0}%</strong>
      </div>
    </Wrap>
  );
}
