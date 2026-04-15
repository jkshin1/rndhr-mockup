import styled from 'styled-components';
import SummaryCard from '../molecules/SummaryCard';
import MiddleJobBadge from '../atoms/MiddleJobBadge';
import RiskChip from '../molecules/RiskChip';
import { computeFunctionOrgImpact, type TFTemplate, type FunctionOrgImpact, type FunctionRiskLevel } from '../../data/mockData';

const SUB_ORDER = ['PI', 'Device', 'FA', 'Photo공정', 'Etch공정', 'Diffusion공정', 'ThinFilm공정', 'C&C공정'] as const;

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
  grid-template-columns: 150px 1fr 240px;
  gap: 16px; align-items: center;
  padding: 14px 0 10px;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.borderLight};
  &:last-child { border-bottom: none; }
`;

const RowLabel = styled.div`display: flex; flex-direction: column; gap: 4px;`;
const RowLabelName = styled.strong`font-size: 14px; color: ${({ theme }) => theme.colors.textPrimary};`;

const BarArea = styled.div`position: relative; height: 30px; margin-top: 14px;`;
const BarTrack = styled.div`position: absolute; inset: 0; display: flex; border-radius: 6px; overflow: hidden; background: #f1f5f9;`;

const RemainBar = styled.div<{ $risk: FunctionRiskLevel; $pct: number }>`
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
const GapRow = styled.div<{ $risk: FunctionRiskLevel }>`
  font-weight: 700; font-size: 12px;
  color: ${({ theme, $risk }) => theme.colors.risk[$risk].text};
`;
const CompRow = styled.div`color: #64748b; font-size: 11px; display: flex; align-items: center; gap: 4px;
  em { font-style: normal; font-weight: 700; color: #be123c; }
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

export default function FunctionOrgImpactSection({ template }: { template: TFTemplate }) {
  const raw = computeFunctionOrgImpact(template.id);
  const items: FunctionOrgImpact[] = SUB_ORDER
    .map((sj) => raw.find((r) => r.subJob === sj))
    .filter((x): x is FunctionOrgImpact => Boolean(x));

  const tdPulled   = items.filter((i) => i.functionMiddle === 'TD').reduce((s, i) => s + i.pulledCount, 0);
  const gongPulled = items.filter((i) => i.functionMiddle === '공정').reduce((s, i) => s + i.pulledCount, 0);
  const totalPulled = tdPulled + gongPulled;
  const highItems   = items.filter((i) => i.riskLevel === 'high');
  const mediumItems = items.filter((i) => i.riskLevel === 'medium');
  const maxOriginal = Math.max(...items.map((i) => i.originalCount));
  const pct = (n: number) => (n / maxOriginal) * 100;

  return (
    <Wrap>
      <SummaryGrid>
        <SummaryCard label="총 차출 인력"   value={`${totalPulled}명`}       color="#6366f1" />
        <SummaryCard label="TD 조직 차출"   value={`${tdPulled}명`}          color="#2563eb" />
        <SummaryCard label="공정 조직 차출" value={`${gongPulled}명`}        color="#d97706" />
        <SummaryCard label="고위험 직무"    value={`${highItems.length}개`}   color="#ef4444" />
        <SummaryCard label="중위험 직무"    value={`${mediumItems.length}개`} color="#f59e0b" />
      </SummaryGrid>

      <BarsPanel>
        <Legend>
          <span><LegendBox $variant="remain" />잔여 인력</span>
          <span><LegendBox $variant="pulled" />TF 차출</span>
          <span><LegendBox $variant="min" />최소 필요 인력</span>
        </Legend>
        {items.map((item) => (
          <BarRow key={item.subJob}>
            <RowLabel>
              <MiddleJobBadge type={item.functionMiddle} />
              <RowLabelName>{item.subJob}</RowLabelName>
              <RiskChip level={item.riskLevel} />
            </RowLabel>
            <BarArea>
              <BarTrack>
                <RemainBar $risk={item.riskLevel} $pct={pct(item.remainingCount)}>
                  {pct(item.remainingCount) > 10 && <span>{item.remainingCount}</span>}
                </RemainBar>
                <PulledBar $pct={pct(item.pulledCount)}>
                  {pct(item.pulledCount) > 6 && <span>−{item.pulledCount}</span>}
                </PulledBar>
              </BarTrack>
              <MinLine $pct={pct(item.minimumRequired)}>
                <MinLabel>min {item.minimumRequired}</MinLabel>
              </MinLine>
            </BarArea>
            <Stats>
              <FlowRow>
                <span>{item.originalCount}명</span>
                <span className="arrow">→</span>
                <strong>{item.remainingCount}명</strong>
                <span className="delta">(−{item.pulledCount})</span>
              </FlowRow>
              <GapRow $risk={item.riskLevel}>
                {item.shortage > 0 ? `▼ 최소 기준 ${item.shortage}명 부족` : `✓ ${item.margin}명 여유`}
              </GapRow>
              <CompRow>
                역량 {item.competencyBefore} <span className="arrow">→</span> {item.competencyAfter}
                {item.competencyDrop > 0 && <em> (−{item.competencyDrop}pt)</em>}
              </CompRow>
            </Stats>
          </BarRow>
        ))}
      </BarsPanel>

      {(highItems.length > 0 || mediumItems.length > 0) && (
        <ActionsWrap>
          {highItems.length > 0 && (
            <ActionCard $variant="high">
              <Icon>⚠️</Icon>
              <CardBody>
                <CardTitle $variant="high">Function 조직 고위험 발생</CardTitle>
                <CardDesc><strong>{highItems.length}개 직무</strong>에서 최소 운영 인원 미달 또는 핵심 인력 손실 발생</CardDesc>
                <TagList>
                  {highItems.map((i) => (
                    <ItemRow key={i.subJob}>
                      <ItemTag>{i.functionMiddle} · <strong>{i.subJob}</strong></ItemTag>
                      <ItemMsg>
                        {i.shortage > 0
                          ? `잔여 ${i.remainingCount}명 (최소 ${i.minimumRequired}명) · ${i.shortage}명 충원 또는 차출 축소 검토`
                          : `핵심 인력 차출로 역량 ${i.competencyDrop}pt 하락 · 대체 인력 확보 필요`}
                      </ItemMsg>
                    </ItemRow>
                  ))}
                </TagList>
              </CardBody>
            </ActionCard>
          )}
          {mediumItems.length > 0 && (
            <ActionCard $variant="medium">
              <Icon>📌</Icon>
              <CardBody>
                <CardTitle $variant="medium">Function 조직 모니터링 필요</CardTitle>
                <CardDesc><strong>{mediumItems.length}개 직무</strong>가 최소 운영 기준에 근접 · 추가 차출 시 리스크 전환 가능</CardDesc>
                <TagList>
                  {mediumItems.map((i) => (
                    <MediumTag key={i.subJob}>{i.subJob} (여유 {i.margin}명 · 역량 −{i.competencyDrop}pt)</MediumTag>
                  ))}
                </TagList>
              </CardBody>
            </ActionCard>
          )}
        </ActionsWrap>
      )}
    </Wrap>
  );
}
