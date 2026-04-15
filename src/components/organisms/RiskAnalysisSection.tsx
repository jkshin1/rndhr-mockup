import styled from 'styled-components';
import SummaryCard from '../molecules/SummaryCard';
import RiskChip from '../molecules/RiskChip';
import MiddleJobBadge from '../atoms/MiddleJobBadge';
import ActionPill from '../atoms/ActionPill';
import type { TFTemplate } from '../../data/mockData';

const SUB_JOBS_ORDER = ['PI', 'Device', 'FA', 'Photo공정', 'Etch공정', 'Diffusion공정', 'ThinFilm공정', 'C&C공정'] as const;
type RiskLevel = 'high' | 'medium' | 'low';
type Action = '신규 채용' | '코칭·육성' | '현 수준 유지';

interface RiskItem {
  subJob: string; middleJob: string;
  currentCount: number; targetCount: number; countGap: number;
  actualScore: number; targetScore: number; compGap: number;
  riskLevel: RiskLevel; actions: Action[];
}

function computeRisk(countGap: number, compGap: number): { riskLevel: RiskLevel; actions: Action[] } {
  const riskLevel: RiskLevel =
    compGap >= 15 || (compGap >= 8 && countGap >= 10) ? 'high'
    : compGap >= 6 || countGap >= 7 ? 'medium' : 'low';
  const actions: Action[] = [];
  if (countGap >= 7) actions.push('신규 채용');
  if (compGap >= 6) actions.push('코칭·육성');
  if (actions.length === 0) actions.push('현 수준 유지');
  return { riskLevel, actions };
}

/* ── Styled components ── */
const Wrap = styled.div`display: flex; flex-direction: column; gap: 16px;`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
`;

/* Table */
const Table = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const THead = styled.div`
  display: grid;
  grid-template-columns: 160px 90px 90px 90px 90px 90px 1fr;
  padding: 10px 16px;
  background: #f8fafc;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;

  span { text-align: center; }
  span:first-child { text-align: left; }
  span:last-child { text-align: left; }
`;

const TRow = styled.div<{ $risk: RiskLevel }>`
  display: grid;
  grid-template-columns: 160px 90px 90px 90px 90px 90px 1fr;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-left: 4px solid ${({ theme, $risk }) => theme.colors.risk[$risk].dot};
  background: ${({ theme, $risk }) => theme.colors.risk[$risk].bg};
  align-items: center;

  &:last-child { border-bottom: none; }
`;

const SubJobCell = styled.div`display: flex; align-items: center; gap: 8px;`;
const NumCell = styled.span`text-align: center; font-size: 13px; font-weight: 500; display: block;`;
const GapCell = styled.span<{ $neg: boolean }>`
  text-align: center; display: block; font-size: 12px; font-weight: 700;
  color: ${({ $neg, theme }) => $neg ? theme.colors.risk.high.text : theme.colors.risk.low.text};
`;
const ActionsCell = styled.div`display: flex; gap: 4px; flex-wrap: wrap;`;

/* Action cards */
const ActionCards = styled.div`display: flex; flex-direction: column; gap: 10px;`;
const ActionCard = styled.div<{ $type: 'hire' | 'coach' }>`
  display: flex; gap: 14px;
  background: ${({ $type }) => $type === 'hire' ? '#fff1f2' : '#eff6ff'};
  border: 1px solid ${({ $type }) => $type === 'hire' ? '#fecdd3' : '#bfdbfe'};
  border-left: 4px solid ${({ $type }) => $type === 'hire' ? '#ef4444' : '#3b82f6'};
  border-radius: 10px; padding: 16px 18px;
`;
const ActionCardIcon = styled.div`font-size: 26px; line-height: 1;`;
const ActionCardBody = styled.div`flex: 1; display: flex; flex-direction: column; gap: 8px;`;
const ActionCardTitle = styled.div<{ $type: 'hire' | 'coach' }>`
  font-size: 15px; font-weight: 700;
  color: ${({ $type }) => $type === 'hire' ? '#7f1d1d' : '#1e3a5f'};
`;
const ActionCardDesc = styled.div`font-size: 13px; color: #475569; strong { font-weight: 700; }`;
const TagList = styled.div`display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;`;
const JobTag = styled.span<{ $type: 'hire' | 'coach' }>`
  padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
  background: #fff;
  border: 1px solid ${({ $type }) => $type === 'hire' ? '#fecdd3' : '#bfdbfe'};
  color: ${({ $type }) => $type === 'hire' ? '#be123c' : '#1d4ed8'};
`;

export default function RiskAnalysisSection({ template }: { template: TFTemplate }) {
  const items: RiskItem[] = SUB_JOBS_ORDER.map((sj) => {
    const dist = template.jobDistribution.find((d) => d.subJob === sj);
    const actualScore = template.competencyScores.find((c) => c.subJob === sj)?.score ?? 0;
    const targetScore = template.targetCompetencyScores.find((c) => c.subJob === sj)?.score ?? 0;
    const currentCount = dist?.count ?? 0, targetCount = dist?.targetCount ?? 0;
    const countGap = Math.max(0, targetCount - currentCount);
    const compGap = Math.max(0, targetScore - actualScore);
    const { riskLevel, actions } = computeRisk(countGap, compGap);
    return { subJob: sj, middleJob: dist?.middleJob ?? '소자', currentCount, targetCount, countGap, actualScore, targetScore, compGap, riskLevel, actions };
  });

  const highItems = items.filter((i) => i.riskLevel === 'high');
  const mediumItems = items.filter((i) => i.riskLevel === 'medium');
  const lowItems = items.filter((i) => i.riskLevel === 'low');
  const hiringItems = items.filter((i) => i.actions.includes('신규 채용'));
  const coachItems = items.filter((i) => i.actions.includes('코칭·육성'));
  const totalHiring = hiringItems.reduce((s, i) => s + i.countGap, 0);

  return (
    <Wrap>
      <SummaryGrid>
        <SummaryCard label="고위험 직무" value={`${highItems.length}`}   color="#ef4444" />
        <SummaryCard label="중위험 직무" value={`${mediumItems.length}`} color="#f59e0b" />
        <SummaryCard label="저위험 직무" value={`${lowItems.length}`}    color="#22c55e" />
        <SummaryCard label="신규 채용 필요" value={`${totalHiring}명`}   color="#6366f1" />
        <SummaryCard label="코칭 대상 직무" value={`${coachItems.length}개`} color="#0ea5e9" />
      </SummaryGrid>

      <Table>
        <THead>
          <span>직무</span>
          <span style={{ textAlign: 'center' }}>위험도</span>
          <span style={{ textAlign: 'center' }}>현재</span>
          <span style={{ textAlign: 'center' }}>필요</span>
          <span style={{ textAlign: 'center' }}>인원 Gap</span>
          <span style={{ textAlign: 'center' }}>역량 Gap</span>
          <span>권고 조치</span>
        </THead>
        {items.map((item) => (
          <TRow key={item.subJob} $risk={item.riskLevel}>
            <SubJobCell>
              <MiddleJobBadge type={item.middleJob} />
              <strong style={{ fontSize: 13 }}>{item.subJob}</strong>
            </SubJobCell>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RiskChip level={item.riskLevel} />
            </div>
            <NumCell>{item.currentCount}명</NumCell>
            <NumCell>{item.targetCount}명</NumCell>
            <GapCell $neg={item.countGap > 0}>{item.countGap > 0 ? `▼ ${item.countGap}명` : '✓'}</GapCell>
            <GapCell $neg={item.compGap > 0}>{item.compGap > 0 ? `▼ ${item.compGap}pt` : '✓'}</GapCell>
            <ActionsCell>
              {item.actions.map((act) => <ActionPill key={act} action={act} />)}
            </ActionsCell>
          </TRow>
        ))}
      </Table>

      <ActionCards>
        {hiringItems.length > 0 && (
          <ActionCard $type="hire">
            <ActionCardIcon>👤</ActionCardIcon>
            <ActionCardBody>
              <ActionCardTitle $type="hire">신규 채용 필요</ActionCardTitle>
              <ActionCardDesc><strong>{hiringItems.length}개 직무</strong>에서 총 <strong>{totalHiring}명</strong> 충원 필요</ActionCardDesc>
              <TagList>
                {hiringItems.map((i) => <JobTag key={i.subJob} $type="hire">{i.subJob} ({i.countGap}명)</JobTag>)}
              </TagList>
            </ActionCardBody>
          </ActionCard>
        )}
        {coachItems.length > 0 && (
          <ActionCard $type="coach">
            <ActionCardIcon>📚</ActionCardIcon>
            <ActionCardBody>
              <ActionCardTitle $type="coach">코칭 및 육성 프로그램 필요</ActionCardTitle>
              <ActionCardDesc><strong>{coachItems.length}개 직무</strong> 대상 역량 강화 교육 및 코칭 프로그램 운영 필요</ActionCardDesc>
              <TagList>
                {coachItems.map((i) => <JobTag key={i.subJob} $type="coach">{i.subJob} (−{i.compGap}pt)</JobTag>)}
              </TagList>
            </ActionCardBody>
          </ActionCard>
        )}
      </ActionCards>
    </Wrap>
  );
}
