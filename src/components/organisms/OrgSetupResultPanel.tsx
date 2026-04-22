import { useState } from 'react';
import { Button, Tooltip } from 'antd';
import styled from 'styled-components';
import SummaryCard from '../molecules/SummaryCard';
import RiskChip from '../molecules/RiskChip';
import OrgJobDistributionChart from './OrgJobDistributionChart';
import OrgCompetencyChart from './OrgCompetencyChart';
import OrgFunctionImpactSection from './OrgFunctionImpactSection';
import type {
  OrgSetupSimResult,
  OrgSimSummary,
  OrgPlacementResult,
  OrgCandidate,
  SourceTeamImpact,
  DamDangRisk,
  CompetencyGapItem,
  CareerDevelopment,
} from '../../data/orgSetupSimulation';
import type { OrgSetupResult } from '../../data/orgSetupData';

// ── Types ────────────────────────────────────────────────────
type RiskLevel = 'high' | 'medium' | 'low';

interface Props {
  result: OrgSetupSimResult;
  setupInput: OrgSetupResult;
  onReset: () => void;
}

// ── Shared Styled Components ─────────────────────────────────

const Panel = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const Section = styled.section`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 24px 28px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const SectionTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 4px;
`;

const SectionSub = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 18px;
`;

const SectionBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// ── 1. Header ────────────────────────────────────────────────

const HeaderCard = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border-left: 6px solid ${({ theme }) => theme.colors.primary};
  padding: 24px 28px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  align-items: center;
  gap: 24px;
`;

const HeaderInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const HeaderTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HeaderSubtitle = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

const ScoreCircle = styled.div<{ $score: number }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 4px solid ${({ $score }) =>
    $score >= 80 ? '#22c55e' : $score >= 60 ? '#f59e0b' : '#ef4444'};
  background: ${({ $score }) =>
    $score >= 80 ? '#f0fdf4' : $score >= 60 ? '#fffbeb' : '#fff1f2'};
`;

const ScoreValue = styled.span<{ $score: number }>`
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  color: ${({ $score }) =>
    $score >= 80 ? '#15803d' : $score >= 60 ? '#b45309' : '#be123c'};
`;

const ScoreUnit = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
`;

// ── 2. Summary Cards ─────────────────────────────────────────

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
`;

// ── Charts Row (직무 구성 현황 · 필요 역량 vs 배치 후 역량) ──

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

// ── 3. Placement Details ─────────────────────────────────────

const AccordionWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AccordionItem = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`;

const AccordionHeader = styled.button<{ $open: boolean }>`
  display: grid;
  grid-template-columns: 1fr 100px 100px 100px 100px;
  width: 100%;
  padding: 14px 20px;
  background: ${({ $open }) => ($open ? '#f0f7ff' : '#f8fafc')};
  border: none;
  cursor: pointer;
  align-items: center;
  font-size: 13px;
  gap: 8px;
  transition: background 0.15s;

  &:hover {
    background: #f0f7ff;
  }
`;

const AccordionJobName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: left;
`;

const AccordionMetric = styled.span<{ $color?: string }>`
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $color }) => $color || '#475569'};
`;

const AccordionContent = styled.div`
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
`;

const CandidateTable = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`;

const CTHead = styled.div`
  display: grid;
  grid-template-columns: 80px 70px 70px 130px 120px 90px 90px 1fr;
  padding: 10px 14px;
  background: #f8fafc;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.03em;

  span { text-align: center; }
  span:first-child { text-align: left; }
  span:last-child { text-align: left; }
`;

const CTRow = styled.div`
  display: grid;
  grid-template-columns: 80px 70px 70px 130px 120px 90px 90px 1fr;
  padding: 10px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  align-items: center;
  font-size: 13px;

  &:last-child { border-bottom: none; }
  &:hover { background: #fafbff; }
`;

const CLBadge = styled.span<{ $cl: 'CL3' | 'CL4' | 'CL5' }>`
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: ${({ theme, $cl }) =>
    $cl === 'CL5' ? theme.colors.cl5.bg :
    $cl === 'CL4' ? theme.colors.cl4.bg :
    theme.colors.cl3.bg};
  color: ${({ theme, $cl }) =>
    $cl === 'CL5' ? theme.colors.cl5.text :
    $cl === 'CL4' ? theme.colors.cl4.text :
    theme.colors.cl3.text};
  border: 1px solid ${({ theme, $cl }) =>
    $cl === 'CL5' ? theme.colors.cl5.border :
    $cl === 'CL4' ? theme.colors.cl4.border :
    theme.colors.cl3.border};
`;

const MiniBar = styled.div<{ $value: number; $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;

  span {
    font-size: 12px;
    font-weight: 600;
    color: ${({ $color }) => $color};
    min-width: 28px;
    text-align: right;
  }
`;

const MiniBarTrack = styled.div`
  width: 48px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
`;

const MiniBarFill = styled.div<{ $value: number; $color: string }>`
  height: 100%;
  width: ${({ $value }) => $value}%;
  background: ${({ $color }) => $color};
  border-radius: 3px;
`;

const StrengthTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
`;

const SmallTag = styled.span`
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  background: #e0e7ff;
  color: #3730a3;
`;

// ── 4. Source Team Risk ───────────────────────────────────────

const RiskSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const TeamTable = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const TTHead = styled.div`
  display: grid;
  grid-template-columns: 120px 120px 80px 70px 70px 80px 90px 1fr;
  padding: 10px 14px;
  background: #f8fafc;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.03em;

  span { text-align: center; }
  span:first-child { text-align: left; }
  span:last-child { text-align: left; }
`;

const TTRow = styled.div<{ $risk: RiskLevel }>`
  display: grid;
  grid-template-columns: 120px 120px 80px 70px 70px 80px 90px 1fr;
  padding: 12px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-left: 4px solid ${({ theme, $risk }) => theme.colors.risk[$risk].dot};
  background: ${({ theme, $risk }) => theme.colors.risk[$risk].bg};
  align-items: center;
  font-size: 13px;

  &:last-child { border-bottom: none; }
`;

const NumCell = styled.span`
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  display: block;
`;

const RolesCell = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
`;

const RoleTag = styled.span`
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 500;
`;

// ── 5. DamDang Risk ──────────────────────────────────────────

const DamDangCard = styled.div<{ $risk: RiskLevel }>`
  border: 1px solid ${({ theme, $risk }) => theme.colors.risk[$risk].border};
  border-left: 5px solid ${({ theme, $risk }) => theme.colors.risk[$risk].dot};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme, $risk }) => theme.colors.risk[$risk].bg};
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const DamDangHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DamDangName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const DamDangStats = styled.div`
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  strong { font-weight: 700; color: ${({ theme }) => theme.colors.textPrimary}; }
`;

const DamDangSubTable = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
  background: #fff;
`;

const DSTHead = styled.div`
  display: grid;
  grid-template-columns: 1fr 80px 80px 100px;
  padding: 8px 14px;
  background: #f8fafc;
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  span { text-align: center; }
  span:first-child { text-align: left; }
`;

const DSTRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 80px 80px 100px;
  padding: 8px 14px;
  font-size: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  align-items: center;

  &:last-child { border-bottom: none; }

  span { text-align: center; }
  span:first-child { text-align: left; font-weight: 600; }
`;

// ── 6. Hiring / Development Action Cards ─────────────────────

const ActionCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ActionCard = styled.div<{ $type: 'hire' | 'coach' }>`
  display: flex;
  gap: 14px;
  background: ${({ $type }) => ($type === 'hire' ? '#fff1f2' : '#eff6ff')};
  border: 1px solid ${({ $type }) => ($type === 'hire' ? '#fecdd3' : '#bfdbfe')};
  border-left: 4px solid ${({ $type }) => ($type === 'hire' ? '#ef4444' : '#3b82f6')};
  border-radius: 10px;
  padding: 18px 20px;
`;

const ActionCardIcon = styled.div`
  font-size: 28px;
  line-height: 1;
`;

const ActionCardBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ActionCardTitle = styled.div<{ $type: 'hire' | 'coach' }>`
  font-size: 15px;
  font-weight: 700;
  color: ${({ $type }) => ($type === 'hire' ? '#7f1d1d' : '#1e3a5f')};
`;

const ActionCardDesc = styled.div`
  font-size: 13px;
  color: #475569;
  strong { font-weight: 700; }
`;

const ActionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ActionItem = styled.div<{ $type: 'hire' | 'coach' }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid ${({ $type }) => ($type === 'hire' ? '#fecdd3' : '#bfdbfe')};
  border-radius: 6px;
`;

const ActionItemLabel = styled.span<{ $type: 'hire' | 'coach' }>`
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  color: ${({ $type }) => ($type === 'hire' ? '#be123c' : '#1d4ed8')};
`;

const ActionItemDesc = styled.span`
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
`;

// ── 7. Competency Gap ────────────────────────────────────────

const GapTable = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const GapTHead = styled.div`
  display: grid;
  grid-template-columns: 140px 80px 80px 100px 80px 1fr 80px;
  padding: 10px 14px;
  background: #f8fafc;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.03em;

  span { text-align: center; }
  span:first-child { text-align: left; }
  span:nth-child(6) { text-align: left; }
`;

const GapTRow = styled.div`
  display: grid;
  grid-template-columns: 140px 80px 80px 100px 80px 1fr 80px;
  padding: 12px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  align-items: center;
  font-size: 13px;

  &:last-child { border-bottom: none; }
  &:hover { background: #fafbff; }
`;

const GapBarWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
`;

const GapBar = styled.div<{ $gap: number; $priority: 'critical' | 'important' | 'normal' }>`
  width: 50px;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $gap }) => Math.min(($gap / 30) * 100, 100)}%;
    border-radius: 4px;
    background: ${({ $priority }) =>
      $priority === 'critical' ? '#ef4444' :
      $priority === 'important' ? '#f59e0b' : '#22c55e'};
  }
`;

const PriorityBadge = styled.span<{ $priority: 'critical' | 'important' | 'normal' }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  background: ${({ $priority }) =>
    $priority === 'critical' ? '#fff1f2' :
    $priority === 'important' ? '#fffbeb' : '#f0fdf4'};
  color: ${({ $priority }) =>
    $priority === 'critical' ? '#be123c' :
    $priority === 'important' ? '#b45309' : '#15803d'};
  border: 1px solid ${({ $priority }) =>
    $priority === 'critical' ? '#fecdd3' :
    $priority === 'important' ? '#fde68a' : '#bbf7d0'};
`;

// ── 8. Career Development ────────────────────────────────────

const CareerCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`;

const CareerHeader = styled.button<{ $open: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: ${({ $open }) => ($open ? '#f0f7ff' : '#f8fafc')};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;

  &:hover { background: #f0f7ff; }
`;

const CareerName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const CareerRole = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const CareerChevron = styled.span<{ $open: boolean }>`
  margin-left: auto;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  transition: transform 0.2s;
  transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
`;

const CareerBody = styled.div`
  padding: 18px 22px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #fff;
`;

const CareerSubTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 6px;
`;

const StrengthBars = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StrengthBarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StrengthLabel = styled.span`
  font-size: 12px;
  width: 120px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: right;
  flex-shrink: 0;
`;

const StrengthBarTrack = styled.div`
  flex: 1;
  height: 14px;
  background: #e2e8f0;
  border-radius: 7px;
  overflow: hidden;
  max-width: 300px;
`;

const StrengthBarFill = styled.div<{ $level: number }>`
  height: 100%;
  width: ${({ $level }) => $level}%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 6px;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
`;

const CareerInfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};

  strong { color: ${({ theme }) => theme.colors.textPrimary}; font-weight: 600; }
`;

const DevTable = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
`;

const DevTHead = styled.div`
  display: grid;
  grid-template-columns: 140px 100px 100px 1fr;
  padding: 8px 14px;
  background: #f8fafc;
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  span { text-align: center; }
  span:first-child { text-align: left; }
  span:last-child { text-align: left; }
`;

const DevTRow = styled.div`
  display: grid;
  grid-template-columns: 140px 100px 100px 1fr;
  padding: 8px 14px;
  font-size: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  align-items: center;

  &:last-child { border-bottom: none; }

  span { text-align: center; }
  span:first-child { text-align: left; font-weight: 600; }
  span:last-child { text-align: left; color: #475569; }
`;

const LevelArrow = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;

  .from { color: #94a3b8; }
  .arrow { color: #64748b; }
  .to { color: #1e3a5f; font-weight: 700; }
`;

// ── 9. Bottom Nav ────────────────────────────────────────────

const BottomNav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
`;

// ── Helper functions ─────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function fulfillColor(rate: number): string {
  const pct = rate <= 1 ? rate * 100 : rate;
  if (pct >= 90) return '#15803d';
  if (pct >= 70) return '#b45309';
  return '#be123c';
}

// ── Sub-components ───────────────────────────────────────────

function PlacementAccordion({ placement }: { placement: OrgPlacementResult }) {
  const [open, setOpen] = useState(false);

  return (
    <AccordionItem>
      <AccordionHeader $open={open} onClick={() => setOpen((v) => !v)}>
        <AccordionJobName>
          {placement.detailJobName}
          {placement.subItems && placement.subItems.length > 0 && (
            <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>
              ({placement.subItems.join(', ')})
            </span>
          )}
        </AccordionJobName>
        <AccordionMetric>{placement.requestedHeadcount}명 요청</AccordionMetric>
        <AccordionMetric $color={scoreColor(placement.avgPlacedScore)}>
          {placement.avgPlacedScore}점
        </AccordionMetric>
        <AccordionMetric $color={fulfillColor(placement.fulfillmentRate)}>
          {Math.round(placement.fulfillmentRate * 100)}%
        </AccordionMetric>
        <AccordionMetric $color={placement.scoreGap > 0 ? '#be123c' : '#15803d'}>
          {placement.scoreGap > 0 ? `▼${placement.scoreGap}` : '✓'}
        </AccordionMetric>
      </AccordionHeader>
      {open && (
        <AccordionContent>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
            {placement.description}
          </div>
          <CandidateTable>
            <CTHead>
              <span>이름</span>
              <span>CL등급</span>
              <span>경력</span>
              <span>현재 팀</span>
              <span>기술기둥</span>
              <span>매칭점수</span>
              <span>역량점수</span>
              <span>강점</span>
            </CTHead>
            {placement.candidates.map((c) => (
              <CTRow key={c.id}>
                <span style={{ fontWeight: 600 }}>{c.name}</span>
                <span style={{ textAlign: 'center' }}>
                  <CLBadge $cl={c.cl}>{c.cl}</CLBadge>
                </span>
                <NumCell>{c.careerYears}년</NumCell>
                <Tooltip title={`${c.currentDamDang} > ${c.currentTeam}`}>
                  <span style={{ textAlign: 'center', fontSize: 12, color: '#475569' }}>{c.currentTeam}</span>
                </Tooltip>
                <span style={{ textAlign: 'center', fontSize: 12 }}>{c.techPillar}</span>
                <MiniBar $value={c.matchScore} $color={scoreColor(c.matchScore)}>
                  <span>{c.matchScore}</span>
                  <MiniBarTrack>
                    <MiniBarFill $value={c.matchScore} $color={scoreColor(c.matchScore)} />
                  </MiniBarTrack>
                </MiniBar>
                <MiniBar $value={c.currentCompetencyScore} $color={scoreColor(c.currentCompetencyScore)}>
                  <span>{c.currentCompetencyScore}</span>
                  <MiniBarTrack>
                    <MiniBarFill $value={c.currentCompetencyScore} $color={scoreColor(c.currentCompetencyScore)} />
                  </MiniBarTrack>
                </MiniBar>
                <StrengthTags>
                  {c.strengths.slice(0, 3).map((s) => (
                    <SmallTag key={s}>{s}</SmallTag>
                  ))}
                </StrengthTags>
              </CTRow>
            ))}
          </CandidateTable>
        </AccordionContent>
      )}
    </AccordionItem>
  );
}

function CareerDevCard({ dev }: { dev: CareerDevelopment }) {
  const [open, setOpen] = useState(false);

  return (
    <CareerCard>
      <CareerHeader $open={open} onClick={() => setOpen((v) => !v)}>
        <CareerName>{dev.candidateName}</CareerName>
        <CLBadge $cl={dev.cl}>{dev.cl}</CLBadge>
        <CareerRole>{dev.currentRole}</CareerRole>
        <CareerChevron $open={open}>&#9660;</CareerChevron>
      </CareerHeader>
      {open && (
        <CareerBody>
          {/* Strengths */}
          <div>
            <CareerSubTitle>강점 영역</CareerSubTitle>
            <StrengthBars>
              {dev.strengths.map((s) => (
                <StrengthBarRow key={s.area}>
                  <StrengthLabel>{s.area}</StrengthLabel>
                  <StrengthBarTrack>
                    <StrengthBarFill $level={s.level}>
                      {s.level >= 30 ? `${s.level}` : ''}
                    </StrengthBarFill>
                  </StrengthBarTrack>
                </StrengthBarRow>
              ))}
            </StrengthBars>
          </div>

          {/* R&D Direction */}
          <CareerInfoRow>
            <strong>R&D 방향:</strong> {dev.rndDirection}
          </CareerInfoRow>

          {/* Career Path */}
          <CareerInfoRow>
            <strong>추천 Career 경로:</strong> {dev.careerPath}
          </CareerInfoRow>

          {/* Development Areas */}
          <div>
            <CareerSubTitle>역량 개발 영역</CareerSubTitle>
            <DevTable>
              <DevTHead>
                <span>영역</span>
                <span>현재 → 목표</span>
                <span>Gap</span>
                <span>육성 제안</span>
              </DevTHead>
              {dev.developmentAreas.map((da) => (
                <DevTRow key={da.area}>
                  <span>{da.area}</span>
                  <LevelArrow>
                    <span className="from">{da.currentLevel}</span>
                    <span className="arrow">→</span>
                    <span className="to">{da.targetLevel}</span>
                  </LevelArrow>
                  <span style={{ fontWeight: 700, color: '#be123c' }}>
                    {da.targetLevel - da.currentLevel > 0 ? `▼${da.targetLevel - da.currentLevel}` : '✓'}
                  </span>
                  <span>{da.suggestion}</span>
                </DevTRow>
              ))}
            </DevTable>
          </div>
        </CareerBody>
      )}
    </CareerCard>
  );
}

// ── Collapsible Section ──────────────────────────────────────

const CollapsibleSection = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  overflow: hidden;
`;

const CollapseToggle = styled.button<{ $open: boolean }>`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 28px;
  background: ${({ $open }) => $open ? '#f8faff' : '#fff'};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;

  &:hover { background: #f8faff; }
`;

const CollapseToggleLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CollapseToggleSummaryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
`;

const SummaryChip = styled.span<{ $color?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $color }) => $color ? `${$color}15` : '#f1f5f9'};
  color: ${({ $color }) => $color ?? '#475569'};
  border: 1px solid ${({ $color }) => $color ? `${$color}40` : '#e2e8f0'};
`;

const CollapseChevron = styled.span<{ $open: boolean }>`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  transition: transform 0.22s;
  transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
  margin-top: 3px;
  flex-shrink: 0;
`;

const CollapseBody = styled.div`
  padding: 0 28px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
`;

// ── Main Component ───────────────────────────────────────────

export default function OrgSetupResultPanel({ result, setupInput, onReset }: Props) {
  const { summary } = result;
  const [hireDevOpen, setHireDevOpen] = useState(false);
  const [careerOpen, setCareerOpen] = useState(false);

  const highTeams = result.sourceTeamImpacts.filter((t) => t.riskLevel === 'high').length;
  const mediumTeams = result.sourceTeamImpacts.filter((t) => t.riskLevel === 'medium').length;
  const lowTeams = result.sourceTeamImpacts.filter((t) => t.riskLevel === 'low').length;

  // Pre-compute summary stats for collapsed states
  const totalHiringCount = result.hiringRecommendations.reduce((s, r) => s + r.count, 0);
  const hiringJobCount = result.hiringRecommendations.length;
  const devCount = result.developmentRecommendations.length;
  const devTimeframes = result.developmentRecommendations.map((d) => d.timeframe);
  const shortTermDev = devTimeframes.filter((t) => t.includes('1~3') || t.includes('3~6')).length;
  const longTermDev = devTimeframes.filter((t) => t.includes('6~12') || t.includes('9~12')).length;

  const careerCL = { CL3: 0, CL4: 0, CL5: 0 };
  result.careerDevelopments.forEach((c) => { careerCL[c.cl]++; });
  const avgDevAreas = result.careerDevelopments.length > 0
    ? Math.round(result.careerDevelopments.reduce((s, c) => s + c.developmentAreas.length, 0) / result.careerDevelopments.length)
    : 0;

  return (
    <Panel>
      {/* ── 1. Header ── */}
      <HeaderCard>
        <div style={{ fontSize: 40, lineHeight: 1 }}>&#x2705;</div>
        <HeaderInfo>
          <HeaderTitle>
            {setupInput.subJobLabel} 신설 조직 &mdash; 인력 배치 시뮬레이션 결과
          </HeaderTitle>
          <HeaderSubtitle>
            {setupInput.middleJob} &rsaquo; {setupInput.subJobLabel} &middot; 세부 직무 {setupInput.requirements.length}개 &middot; 총 {setupInput.totalHeadcount}명 요청
          </HeaderSubtitle>
        </HeaderInfo>
        <Tooltip title={`종합 배치 적합도 ${summary.overallScore}점`}>
          <ScoreCircle $score={summary.overallScore}>
            <ScoreValue $score={summary.overallScore}>{summary.overallScore}</ScoreValue>
            <ScoreUnit>종합점수</ScoreUnit>
          </ScoreCircle>
        </Tooltip>
      </HeaderCard>

      {/* ── 2. Summary Cards ── */}
      <SummaryGrid>
        <SummaryCard label="배치 적합도" value={`${summary.overallScore}점`} color="#1e3a5f" />
        <SummaryCard label="배치 인원" value={`${summary.totalPlaced}/${summary.totalRequested}명`} color="#2563eb" />
        <SummaryCard label="역량 충족률" value={`${Math.round(summary.competencyFillRate * 100)}%`} color="#16a34a" />
        <SummaryCard label="신규 채용 필요" value={`${summary.newHiringNeeded}명`} color={summary.newHiringNeeded > 0 ? '#ef4444' : '#22c55e'} />
        <SummaryCard label="육성 필요 인원" value={`${summary.developmentNeeded}명`} color={summary.developmentNeeded > 0 ? '#f59e0b' : '#22c55e'} />
        <SummaryCard label="리스크 팀" value={`${summary.riskTeamCount}개`} color={summary.riskTeamCount > 0 ? '#ef4444' : '#22c55e'} />
      </SummaryGrid>

      {/* ── 2-1. Charts Row: 직무 구성 현황 · 필요 역량 vs 배치 후 역량 ── */}
      <ChartsRow>
        <Section>
          <SectionTitle>직무 구성 현황</SectionTitle>
          <SectionSub>세부 직무별 요청 인원 대비 배치 인원</SectionSub>
          <OrgJobDistributionChart placements={result.placements} setupInput={setupInput} compact />
        </Section>
        <Section>
          <SectionTitle>필요 역량 vs 배치 후 역량</SectionTitle>
          <SectionSub>세부 직무별 목표 역량 대비 실제 배치 후 역량 비교</SectionSub>
          <OrgCompetencyChart placements={result.placements} compact />
        </Section>
      </ChartsRow>

      {/* ── 3. Placement Details ── */}
      <Section>
        <SectionTitle>세부 직무별 배치 결과</SectionTitle>
        <SectionSub>신설 조직 각 세부 직무에 대한 배치 후보자 및 적합도 분석</SectionSub>
        <SectionBody>
          {/* Column Labels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 100px 100px 100px',
            padding: '0 20px 8px',
            fontSize: 11,
            fontWeight: 700,
            color: '#94a3b8',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.03em',
          }}>
            <span>직무명</span>
            <span style={{ textAlign: 'center' }}>요청 인원</span>
            <span style={{ textAlign: 'center' }}>평균 점수</span>
            <span style={{ textAlign: 'center' }}>충족률</span>
            <span style={{ textAlign: 'center' }}>Gap</span>
          </div>
          <AccordionWrap>
            {result.placements.map((p) => (
              <PlacementAccordion key={p.detailJobId} placement={p} />
            ))}
          </AccordionWrap>
        </SectionBody>
      </Section>

      {/* ── 4. Source Team Risk ── */}
      <Section>
        <SectionTitle>이전 조직 Risk 분석</SectionTitle>
        <SectionSub>인력 차출에 따른 기존 팀 운영 리스크 점검</SectionSub>
        <SectionBody>
          <RiskSummaryGrid>
            <SummaryCard label="고위험 팀" value={`${highTeams}개`} color="#ef4444" />
            <SummaryCard label="중위험 팀" value={`${mediumTeams}개`} color="#f59e0b" />
            <SummaryCard label="저위험 팀" value={`${lowTeams}개`} color="#22c55e" />
          </RiskSummaryGrid>
          <TeamTable>
            <TTHead>
              <span>팀명</span>
              <span>담당</span>
              <span>현재 인원</span>
              <span>차출</span>
              <span>잔여</span>
              <span>최소필요</span>
              <span>위험도</span>
              <span>영향 직무</span>
            </TTHead>
            {result.sourceTeamImpacts.map((t) => (
              <TTRow key={`${t.teamName}-${t.damDangName}`} $risk={t.riskLevel}>
                <span style={{ fontWeight: 600 }}>{t.teamName}</span>
                <span style={{ textAlign: 'center', fontSize: 12 }}>{t.damDangName}</span>
                <NumCell>{t.currentHeadcount}명</NumCell>
                <NumCell style={{ color: '#be123c', fontWeight: 700 }}>-{t.pulledCount}명</NumCell>
                <NumCell>{t.remainingCount}명</NumCell>
                <NumCell>{t.minimumRequired}명</NumCell>
                <span style={{ display: 'flex', justifyContent: 'center' }}>
                  <RiskChip level={t.riskLevel} />
                </span>
                <RolesCell>
                  {t.affectedRoles.map((r) => (
                    <RoleTag key={r}>{r}</RoleTag>
                  ))}
                </RolesCell>
              </TTRow>
            ))}
          </TeamTable>
        </SectionBody>
      </Section>

      {/* ── 5. DamDang Risk ── */}
      <Section>
        <SectionTitle>상위 조직(담당) 인력 부족 Risk</SectionTitle>
        <SectionSub>담당 단위 인력 부족 및 역량 저하 위험 분석</SectionSub>
        <SectionBody>
          {result.damDangRisks.map((dd) => (
            <DamDangCard key={dd.damDangName} $risk={dd.riskLevel}>
              <DamDangHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <DamDangName>{dd.damDangName}</DamDangName>
                  <RiskChip level={dd.riskLevel} />
                </div>
                <DamDangStats>
                  <span>현재 인원: <strong>{dd.totalCurrentHeadcount}명</strong></span>
                  <span>차출: <strong style={{ color: '#be123c' }}>-{dd.totalPulled}명</strong></span>
                  <span>잔여: <strong>{dd.totalRemaining}명</strong></span>
                  <span>최소 필요: <strong>{dd.minimumRequired}명</strong></span>
                </DamDangStats>
              </DamDangHeader>
              <DamDangSubTable>
                <DSTHead>
                  <span>팀명</span>
                  <span>차출</span>
                  <span>잔여</span>
                  <span>위험도</span>
                </DSTHead>
                {dd.teams.map((t) => (
                  <DSTRow key={t.teamName}>
                    <span>{t.teamName}</span>
                    <span style={{ color: '#be123c', fontWeight: 700 }}>-{t.pulled}명</span>
                    <span>{t.remaining}명</span>
                    <span style={{ display: 'flex', justifyContent: 'center' }}>
                      <RiskChip level={t.riskLevel} />
                    </span>
                  </DSTRow>
                ))}
              </DamDangSubTable>
            </DamDangCard>
          ))}
        </SectionBody>
      </Section>

      {/* ── 5-1. Function 조직 영향 분석 ── */}
      <Section>
        <SectionTitle>Function 조직 영향 분석</SectionTitle>
        <SectionSub>신설 조직 인력 차출에 따른 Function 담당 조직 잔여 인력 및 최소 운영 기준 점검</SectionSub>
        <OrgFunctionImpactSection damDangRisks={result.damDangRisks} middleJob={setupInput.middleJob} />
      </Section>

      {/* ── 6. Competency Gap (역량 Gap 분석 — 채용·육성 위) ── */}
      <Section>
        <SectionTitle>역량 Gap 분석 및 육성 제안</SectionTitle>
        <SectionSub>필요 역량과 현재 구성원 역량 차이 분석</SectionSub>
        <GapTable>
          <GapTHead>
            <span>역량 항목</span>
            <span>필요 수준</span>
            <span>현재 평균</span>
            <span>Gap</span>
            <span>우선순위</span>
            <span>육성 방안</span>
            <span>기간</span>
          </GapTHead>
          {result.competencyGaps.map((g) => (
            <GapTRow key={g.competencyName}>
              <span style={{ fontWeight: 600 }}>{g.competencyName}</span>
              <NumCell>{g.requiredLevel}</NumCell>
              <NumCell>{g.currentAvg}</NumCell>
              <GapBarWrap>
                <span style={{ fontSize: 12, fontWeight: 700, color: g.priority === 'critical' ? '#be123c' : g.priority === 'important' ? '#b45309' : '#15803d' }}>
                  {g.gap > 0 ? `▼${g.gap}` : '✓'}
                </span>
                <GapBar $gap={g.gap} $priority={g.priority} />
              </GapBarWrap>
              <span style={{ textAlign: 'center' }}>
                <PriorityBadge $priority={g.priority}>
                  {g.priority === 'critical' ? '긴급' : g.priority === 'important' ? '중요' : '보통'}
                </PriorityBadge>
              </span>
              <span style={{ fontSize: 12, color: '#475569' }}>{g.developmentPlan}</span>
              <NumCell style={{ fontSize: 12 }}>{g.timeframe}</NumCell>
            </GapTRow>
          ))}
        </GapTable>
      </Section>

      {/* ── 7. Hiring / Development Recommendations (Collapsible) ── */}
      <CollapsibleSection>
        <CollapseToggle $open={hireDevOpen} onClick={() => setHireDevOpen((v) => !v)}>
          <CollapseToggleLeft>
            <SectionTitle style={{ margin: 0 }}>채용 &middot; 육성 의사결정 지원</SectionTitle>
            <SectionSub style={{ margin: 0 }}>시뮬레이션 결과에 기반한 채용 및 육성 권고안</SectionSub>
            {!hireDevOpen && (
              <CollapseToggleSummaryRow>
                {hiringJobCount > 0 && (
                  <SummaryChip $color="#ef4444">
                    📋 신규 채용 {hiringJobCount}개 직무 · {totalHiringCount}명
                  </SummaryChip>
                )}
                {devCount > 0 && (
                  <SummaryChip $color="#2563eb">
                    📚 육성 필요 {devCount}명
                  </SummaryChip>
                )}
                {shortTermDev > 0 && (
                  <SummaryChip $color="#16a34a">
                    단기({shortTermDev}명) 6개월 이내
                  </SummaryChip>
                )}
                {longTermDev > 0 && (
                  <SummaryChip $color="#b45309">
                    장기({longTermDev}명) 6개월 이상
                  </SummaryChip>
                )}
              </CollapseToggleSummaryRow>
            )}
          </CollapseToggleLeft>
          <CollapseChevron $open={hireDevOpen}>&#9660;</CollapseChevron>
        </CollapseToggle>
        {hireDevOpen && (
          <CollapseBody>
            <ActionCards style={{ paddingTop: 20 }}>
              {result.hiringRecommendations.length > 0 && (
                <ActionCard $type="hire">
                  <ActionCardIcon>&#x1F4CB;</ActionCardIcon>
                  <ActionCardBody>
                    <ActionCardTitle $type="hire">신규 채용 필요</ActionCardTitle>
                    <ActionCardDesc>
                      <strong>{hiringJobCount}개 직무</strong>에서 총{' '}
                      <strong>{totalHiringCount}명</strong> 채용 필요
                    </ActionCardDesc>
                    <ActionList>
                      {result.hiringRecommendations.map((hr) => (
                        <ActionItem key={hr.detailJobName} $type="hire">
                          <ActionItemLabel $type="hire">
                            {hr.detailJobName} ({hr.count}명)
                          </ActionItemLabel>
                          <ActionItemDesc>{hr.reason}</ActionItemDesc>
                        </ActionItem>
                      ))}
                    </ActionList>
                  </ActionCardBody>
                </ActionCard>
              )}
              {result.developmentRecommendations.length > 0 && (
                <ActionCard $type="coach">
                  <ActionCardIcon>&#x1F4DA;</ActionCardIcon>
                  <ActionCardBody>
                    <ActionCardTitle $type="coach">구성원 육성 필요</ActionCardTitle>
                    <ActionCardDesc>
                      <strong>{devCount}명</strong>의 구성원에게 역량 육성 프로그램 필요
                    </ActionCardDesc>
                    <ActionList>
                      {result.developmentRecommendations.map((dr) => (
                        <ActionItem key={`${dr.candidateName}-${dr.area}`} $type="coach">
                          <ActionItemLabel $type="coach">
                            {dr.candidateName} &middot; {dr.area}
                          </ActionItemLabel>
                          <ActionItemDesc>{dr.plan} ({dr.timeframe})</ActionItemDesc>
                        </ActionItem>
                      ))}
                    </ActionList>
                  </ActionCardBody>
                </ActionCard>
              )}
            </ActionCards>
          </CollapseBody>
        )}
      </CollapsibleSection>

      {/* ── 8. Career Development (Collapsible) ── */}
      <CollapsibleSection>
        <CollapseToggle $open={careerOpen} onClick={() => setCareerOpen((v) => !v)}>
          <CollapseToggleLeft>
            <SectionTitle style={{ margin: 0 }}>개별 구성원 Career 개발 제안</SectionTitle>
            <SectionSub style={{ margin: 0 }}>R&D 방향에 align된 맞춤형 성장 경로 제안</SectionSub>
            {!careerOpen && (
              <CollapseToggleSummaryRow>
                <SummaryChip $color="#1e3a5f">
                  👥 총 {result.careerDevelopments.length}명 개발 계획
                </SummaryChip>
                {careerCL.CL5 > 0 && <SummaryChip $color="#7e22ce">CL5 · {careerCL.CL5}명</SummaryChip>}
                {careerCL.CL4 > 0 && <SummaryChip $color="#c2410c">CL4 · {careerCL.CL4}명</SummaryChip>}
                {careerCL.CL3 > 0 && <SummaryChip $color="#0369a1">CL3 · {careerCL.CL3}명</SummaryChip>}
                {avgDevAreas > 0 && (
                  <SummaryChip $color="#16a34a">
                    평균 {avgDevAreas}개 역량 개발 영역
                  </SummaryChip>
                )}
              </CollapseToggleSummaryRow>
            )}
          </CollapseToggleLeft>
          <CollapseChevron $open={careerOpen}>&#9660;</CollapseChevron>
        </CollapseToggle>
        {careerOpen && (
          <CollapseBody>
            <SectionBody style={{ paddingTop: 20 }}>
              {result.careerDevelopments.map((dev) => (
                <CareerDevCard key={dev.candidateId} dev={dev} />
              ))}
            </SectionBody>
          </CollapseBody>
        )}
      </CollapsibleSection>

      {/* ── 9. Bottom Nav ── */}
      <BottomNav>
        <Button size="large" onClick={onReset}>
          처음부터 다시
        </Button>
        <Button size="large" disabled>
          보고서 다운로드 (준비 중)
        </Button>
      </BottomNav>
    </Panel>
  );
}
