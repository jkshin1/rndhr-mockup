import { useState } from 'react';
import { Steps, Button, InputNumber, Checkbox, Tooltip } from 'antd';
import styled from 'styled-components';
import {
  getSubJobsByMiddle,
  getSubJobDef,
  type OrgMiddleJob,
  type OrgSubJob,
  type DetailJob,
  type OrgSetupResult,
  type DetailJobRequirement,
} from '../../data/orgSetupData';

// ── Types ────────────────────────────────────────────────────

interface RequirementInput {
  headcount: number;
  targetScore: number;
}

// ── Shared layout ────────────────────────────────────────────

const Wizard = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const StepsBar = styled(Steps)`
  && {
    .ant-steps-item-title   { font-size: 13px !important; font-weight: 600 !important; }
    .ant-steps-item-description { font-size: 11px !important; }
  }
`;

const StepCard = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 32px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const StepHeader = styled.div`
  margin-bottom: 28px;
`;

const StepTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 6px;
`;

const StepDesc = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

const NavRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: 28px;
`;

const NavLeft = styled.div`display: flex; gap: 12px;`;
const NavRight = styled.div`display: flex; gap: 12px; align-items: center;`;
const SelectedHint = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

// ── Step 1: 조직 유형 선택 (소자 / 공정) ─────────────────────

const MiddleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const MiddleCard = styled.button<{ $active: boolean }>`
  border: 2px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 32px 24px;
  background: ${({ $active }) => $active ? '#f0f7ff' : '#fff'};
  cursor: pointer;
  text-align: left;
  transition: all 0.18s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: #f8faff;
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const MiddleCardIcon = styled.div`font-size: 40px; line-height: 1;`;

const MiddleCardTitle = styled.div<{ $active: boolean }>`
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textPrimary};
`;

const MiddleCardDesc = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`;

const MiddleCardSubJobs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
`;

const SmallChip = styled.span<{ $type: '소자' | '공정' }>`
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: ${({ $type }) => $type === '소자' ? '#dbeafe' : '#fef3c7'};
  color: ${({ $type }) => $type === '소자' ? '#1e40af' : '#b45309'};
`;

// ── Step 2: 직무 선택 (PI / CA / FA 등) ─────────────────────

const SubJobGrid = styled.div<{ $count: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $count }) => Math.min($count, 3)}, 1fr);
  gap: 16px;
`;

const SubJobCard = styled.button<{ $active: boolean; $middle: OrgMiddleJob }>`
  border: 2px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 20px;
  background: ${({ $active }) => $active ? '#f0f7ff' : '#fff'};
  cursor: pointer;
  text-align: left;
  transition: all 0.18s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: #f8faff;
    box-shadow: ${({ theme }) => theme.shadows.card};
  }
`;

const SubJobIcon = styled.div`font-size: 28px; line-height: 1;`;
const SubJobLabel = styled.div<{ $active: boolean }>`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textPrimary};
`;
const SubJobDesc = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;
const SubJobDetailCount = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  padding-top: 6px;
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
`;

// ── Step 3: 세부 직무 선택 ───────────────────────────────────

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
`;

const DetailCheckCard = styled.label<{ $checked: boolean }>`
  border: 1.5px solid ${({ theme, $checked }) => $checked ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 14px;
  background: ${({ $checked }) => $checked ? '#f0f7ff' : '#fff'};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.15s ease;
  position: relative;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: #f8faff;
  }
`;

const DetailCheckTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

const DetailJobName = styled.span<{ $checked: boolean }>`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme, $checked }) => $checked ? theme.colors.primary : theme.colors.textPrimary};
  line-height: 1.3;
`;

const SubItemsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 2px;
`;

const SubItemTag = styled.span`
  font-size: 10px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 3px;
  background: #e0e7ff;
  color: #3730a3;
`;

const DetailJobDesc = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.4;
`;

const CareerBadge = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
  flex-shrink: 0;
`;

const SelectAllRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 0 18px;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};
  margin-bottom: 4px;
`;

// ── Step 4: 인력 요건 입력 ───────────────────────────────────

const RequirementsTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const ReqTableHead = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr 140px 160px;
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const ReqTableRow = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr 140px 160px;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  align-items: center;
  background: #fff;
  transition: background 0.1s;

  &:last-child { border-bottom: none; }
  &:hover { background: #fafbff; }
`;

const ReqJobName = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ReqJobNameTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ReqJobDesc = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.4;
`;

const ReqSubItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 2px;
`;

const ScoreRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ScoreLabel = styled.div<{ $score: number }>`
  font-size: 11px;
  font-weight: 700;
  color: ${({ $score }) =>
    $score >= 80 ? '#15803d' : $score >= 65 ? '#b45309' : '#be123c'};
`;

const StyledInputNumber = styled(InputNumber)`
  && {
    width: 100%;
    .ant-input-number-input { font-size: 14px; font-weight: 600; text-align: center; }
  }
`;

// ── Step 5: 완료 요약 ─────────────────────────────────────────

const SummaryWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SummaryHeader = styled.div`
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  background: #f0f7ff;
  border: 1px solid #bfdbfe;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  align-items: center;
`;

const SummaryHeaderInfo = styled.div`display: flex; flex-direction: column; gap: 4px;`;
const SummaryTitle = styled.div`font-size: 18px; font-weight: 700; color: ${({ theme }) => theme.colors.primary};`;
const SummaryMeta  = styled.div`font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary};`;

const SummaryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const StatCard = styled.div<{ $color: string }>`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: 4px solid ${({ $color }) => $color};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatValue = styled.div<{ $color: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

const StatLabel = styled.div`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};`;

const SummaryTable = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const SummaryTableHead = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 100px 100px;
  padding: 10px 18px;
  background: #f8fafc;
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SummaryTableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 100px 100px;
  padding: 12px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  align-items: center;
  font-size: 13px;
  &:last-child { border-bottom: none; }
`;

const ScoreBar = styled.div<{ $score: number }>`
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;

  &::before {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $score }) => $score}%;
    border-radius: 3px;
    background: ${({ $score }) =>
      $score >= 80 ? '#22c55e' : $score >= 65 ? '#f59e0b' : '#ef4444'};
  }
`;

// ── Main Component ────────────────────────────────────────────

const STEPS_CONFIG = [
  { title: '조직 유형',   description: '소자 / 공정 선택' },
  { title: '직무 선택',   description: '세부 직무 카테고리' },
  { title: '항목 선택',   description: '세부 직무 항목 선택' },
  { title: '인력 요건',   description: '인원 및 역량 입력' },
];

interface Props {
  onComplete?: (result: OrgSetupResult) => void;
}

export default function OrgSetupWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [middleJob, setMiddleJob] = useState<OrgMiddleJob | null>(null);
  const [subJob, setSubJob]       = useState<OrgSubJob | null>(null);
  const [selectedDetailIds, setSelectedDetailIds] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<Record<string, RequirementInput>>({});
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<OrgSetupResult | null>(null);

  const subJobDefs   = middleJob ? getSubJobsByMiddle(middleJob) : [];
  const subJobDef    = subJob ? getSubJobDef(subJob) : null;
  const allDetailIds = subJobDef?.detailJobs.map((d) => d.id) ?? [];
  const selectedDetails: DetailJob[] = selectedDetailIds
    .map((id) => subJobDef?.detailJobs.find((d) => d.id === id))
    .filter((d): d is DetailJob => Boolean(d));

  /* ── Handlers ── */
  const handleMiddleSelect = (mj: OrgMiddleJob) => {
    setMiddleJob(mj);
    setSubJob(null);
    setSelectedDetailIds([]);
    setRequirements({});
    setStep(1);
  };

  const handleSubJobSelect = (sj: OrgSubJob) => {
    setSubJob(sj);
    setSelectedDetailIds([]);
    setRequirements({});
  };

  const handleDetailToggle = (id: string) => {
    setSelectedDetailIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDetailIds.length === allDetailIds.length) setSelectedDetailIds([]);
    else setSelectedDetailIds([...allDetailIds]);
  };

  const handleRequirementChange = (id: string, field: 'headcount' | 'targetScore', value: number) => {
    setRequirements((prev) => ({
      ...prev,
      [id]: { headcount: prev[id]?.headcount ?? 1, targetScore: prev[id]?.targetScore ?? 70, [field]: value },
    }));
  };

  const getReq = (id: string): RequirementInput =>
    requirements[id] ?? { headcount: 1, targetScore: 75 };

  const handleComplete = () => {
    if (!middleJob || !subJob || !subJobDef) return;
    const reqs: DetailJobRequirement[] = selectedDetails.map((d) => {
      const req = getReq(d.id);
      return { detailJobId: d.id, detailJobName: d.name, subItems: d.subItems, description: d.description, headcount: req.headcount, targetScore: req.targetScore };
    });
    const totalHeadcount = reqs.reduce((s, r) => s + r.headcount, 0);
    const avgTargetScore = Math.round(reqs.reduce((s, r) => s + r.targetScore, 0) / reqs.length);
    const r: OrgSetupResult = { middleJob, subJob, subJobLabel: subJobDef.label, requirements: reqs, totalHeadcount, avgTargetScore };
    setResult(r);
    setCompleted(true);
    onComplete?.(r);
  };

  const handleReset = () => {
    setStep(0); setMiddleJob(null); setSubJob(null);
    setSelectedDetailIds([]); setRequirements({}); setCompleted(false); setResult(null);
  };

  /* ── 완료 화면 ── */
  if (completed && result) {
    return (
      <Wizard>
        <StepsBar current={4} items={STEPS_CONFIG} />
        <StepCard>
          <SummaryWrap>
            <SummaryHeader>
              <div style={{ fontSize: 36 }}>✅</div>
              <SummaryHeaderInfo>
                <SummaryTitle>인력 요건 입력 완료</SummaryTitle>
                <SummaryMeta>
                  {result.middleJob} › {result.subJobLabel} · 세부 직무 {result.requirements.length}개
                </SummaryMeta>
              </SummaryHeaderInfo>
            </SummaryHeader>

            <SummaryStats>
              <StatCard $color="#6366f1">
                <StatValue $color="#6366f1">{result.totalHeadcount}명</StatValue>
                <StatLabel>총 필요 인원</StatLabel>
              </StatCard>
              <StatCard $color="#2563eb">
                <StatValue $color="#2563eb">{result.requirements.length}개</StatValue>
                <StatLabel>선택된 세부 직무</StatLabel>
              </StatCard>
              <StatCard $color="#16a34a">
                <StatValue $color="#16a34a">{result.avgTargetScore}점</StatValue>
                <StatLabel>평균 목표 역량 스코어</StatLabel>
              </StatCard>
            </SummaryStats>

            <SummaryTable>
              <SummaryTableHead>
                <span>세부 직무</span>
                <span>상세 내용</span>
                <span style={{ textAlign: 'center' }}>필요 인원</span>
                <span style={{ textAlign: 'center' }}>목표 역량</span>
              </SummaryTableHead>
              {result.requirements.map((req) => (
                <SummaryTableRow key={req.detailJobId}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{req.detailJobName}</div>
                    {req.subItems && (
                      <ReqSubItems>
                        {req.subItems.map((s) => <SubItemTag key={s}>{s}</SubItemTag>)}
                      </ReqSubItems>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{req.description}</div>
                  <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 15 }}>{req.headcount}명</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: req.targetScore >= 80 ? '#15803d' : req.targetScore >= 65 ? '#b45309' : '#be123c' }}>
                      {req.targetScore}점
                    </div>
                    <ScoreBar $score={req.targetScore} />
                  </div>
                </SummaryTableRow>
              ))}
            </SummaryTable>

            <NavRow>
              <Button onClick={handleReset}>처음부터 다시</Button>
              <Button type="primary" size="large" style={{ background: '#1e3a5f', borderColor: '#1e3a5f', paddingLeft: 32, paddingRight: 32 }}>
                🔍 인력 추천 시뮬레이션 시작 (준비 중)
              </Button>
            </NavRow>
          </SummaryWrap>
        </StepCard>
      </Wizard>
    );
  }

  return (
    <Wizard>
      <StepsBar current={step} items={STEPS_CONFIG} />

      {/* ── STEP 0: 조직 유형 선택 ── */}
      {step === 0 && (
        <StepCard>
          <StepHeader>
            <StepTitle>어떤 유형의 조직을 신설하시나요?</StepTitle>
            <StepDesc>대분류 직무를 선택하면 세부 직무 카테고리를 선택할 수 있습니다.</StepDesc>
          </StepHeader>
          <MiddleGrid>
            {(['소자', '공정'] as OrgMiddleJob[]).map((mj) => {
              const subs = getSubJobsByMiddle(mj);
              return (
                <MiddleCard key={mj} $active={middleJob === mj} onClick={() => handleMiddleSelect(mj)}>
                  <MiddleCardIcon>{mj === '소자' ? '🔬' : '⚙️'}</MiddleCardIcon>
                  <MiddleCardTitle $active={middleJob === mj}>{mj} 조직</MiddleCardTitle>
                  <MiddleCardDesc>
                    {mj === '소자'
                      ? 'DRAM 소자 특성 개발, 공정 통합, 불량 분석 전문 조직'
                      : '반도체 제조 공정 기술 개발 및 최적화 전문 조직'}
                  </MiddleCardDesc>
                  <MiddleCardSubJobs>
                    {subs.map((s) => (
                      <SmallChip key={s.subJob} $type={mj}>{s.subJob}</SmallChip>
                    ))}
                  </MiddleCardSubJobs>
                </MiddleCard>
              );
            })}
          </MiddleGrid>
        </StepCard>
      )}

      {/* ── STEP 1: 직무 선택 ── */}
      {step === 1 && middleJob && (
        <StepCard>
          <StepHeader>
            <StepTitle>{middleJob} 조직 — 직무를 선택하세요</StepTitle>
            <StepDesc>신설할 조직의 핵심 직무 카테고리를 선택하세요.</StepDesc>
          </StepHeader>
          <SubJobGrid $count={subJobDefs.length}>
            {subJobDefs.map((def) => (
              <SubJobCard
                key={def.subJob}
                $active={subJob === def.subJob}
                $middle={middleJob}
                onClick={() => handleSubJobSelect(def.subJob)}
              >
                <SubJobIcon>{def.icon}</SubJobIcon>
                <SubJobLabel $active={subJob === def.subJob}>{def.label}</SubJobLabel>
                <SubJobDesc>{def.description}</SubJobDesc>
                <SubJobDetailCount>세부 직무 {def.detailJobs.length}개 포함</SubJobDetailCount>
              </SubJobCard>
            ))}
          </SubJobGrid>
          <NavRow>
            <NavLeft>
              <Button onClick={() => { setStep(0); setSubJob(null); }}>이전</Button>
            </NavLeft>
            <NavRight>
              {subJob && <SelectedHint>'{subJob}' 선택됨</SelectedHint>}
              <Button type="primary" disabled={!subJob} onClick={() => setStep(2)}
                style={{ background: '#1e3a5f', borderColor: '#1e3a5f' }}>
                다음
              </Button>
            </NavRight>
          </NavRow>
        </StepCard>
      )}

      {/* ── STEP 2: 세부 직무 선택 ── */}
      {step === 2 && subJobDef && (
        <StepCard>
          <StepHeader>
            <StepTitle>{subJobDef.label} — 세부 직무를 선택하세요</StepTitle>
            <StepDesc>신설 조직에 필요한 세부 직무 항목을 복수 선택할 수 있습니다.</StepDesc>
          </StepHeader>
          <SelectAllRow>
            <Checkbox
              indeterminate={selectedDetailIds.length > 0 && selectedDetailIds.length < allDetailIds.length}
              checked={selectedDetailIds.length === allDetailIds.length}
              onChange={handleSelectAll}
            >
              <span style={{ fontWeight: 600, fontSize: 13 }}>전체 선택</span>
            </Checkbox>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              {selectedDetailIds.length} / {allDetailIds.length}개 선택됨
            </span>
          </SelectAllRow>
          <DetailGrid>
            {subJobDef.detailJobs.map((dj) => {
              const checked = selectedDetailIds.includes(dj.id);
              return (
                <DetailCheckCard key={dj.id} $checked={checked} onClick={() => handleDetailToggle(dj.id)}>
                  <DetailCheckTop>
                    <DetailJobName $checked={checked}>{dj.name}</DetailJobName>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {dj.typicalCareerYears && (
                        <CareerBadge>{dj.typicalCareerYears}년↑</CareerBadge>
                      )}
                      <Checkbox checked={checked} onChange={() => handleDetailToggle(dj.id)} onClick={(e) => e.stopPropagation()} />
                    </div>
                  </DetailCheckTop>
                  {dj.subItems && (
                    <SubItemsRow>
                      {dj.subItems.map((si) => <SubItemTag key={si}>{si}</SubItemTag>)}
                    </SubItemsRow>
                  )}
                  <Tooltip title={dj.description}>
                    <DetailJobDesc>{dj.description}</DetailJobDesc>
                  </Tooltip>
                </DetailCheckCard>
              );
            })}
          </DetailGrid>
          <NavRow>
            <NavLeft>
              <Button onClick={() => setStep(1)}>이전</Button>
            </NavLeft>
            <NavRight>
              <SelectedHint>{selectedDetailIds.length}개 선택됨</SelectedHint>
              <Button type="primary" disabled={selectedDetailIds.length === 0} onClick={() => setStep(3)}
                style={{ background: '#1e3a5f', borderColor: '#1e3a5f' }}>
                다음
              </Button>
            </NavRight>
          </NavRow>
        </StepCard>
      )}

      {/* ── STEP 3: 인력 요건 입력 ── */}
      {step === 3 && (
        <StepCard>
          <StepHeader>
            <StepTitle>세부 직무별 필요 인원 및 역량 스코어를 입력하세요</StepTitle>
            <StepDesc>
              각 직무의 필요 인원 수와 목표 역량 스코어(0~100)를 입력합니다.
              역량 스코어는 해당 직무 수행에 요구되는 전문성 수준입니다.
            </StepDesc>
          </StepHeader>
          <RequirementsTable>
            <ReqTableHead>
              <span>세부 직무</span>
              <span>상세 내용</span>
              <span style={{ textAlign: 'center' }}>필요 인원 (명)</span>
              <span style={{ textAlign: 'center' }}>목표 역량 스코어 (0~100)</span>
            </ReqTableHead>
            {selectedDetails.map((dj) => {
              const req = getReq(dj.id);
              return (
                <ReqTableRow key={dj.id}>
                  <ReqJobName>
                    <ReqJobNameTitle>{dj.name}</ReqJobNameTitle>
                    {dj.subItems && (
                      <ReqSubItems>
                        {dj.subItems.map((si) => <SubItemTag key={si}>{si}</SubItemTag>)}
                      </ReqSubItems>
                    )}
                    {dj.typicalCareerYears && (
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>
                        권장 경력 {dj.typicalCareerYears}년↑
                      </span>
                    )}
                  </ReqJobName>
                  <ReqJobDesc>{dj.description}</ReqJobDesc>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <StyledInputNumber
                      min={1} max={200}
                      value={req.headcount}
                      onChange={(v) => handleRequirementChange(dj.id, 'headcount', Number(v) || 1)}
                      addonAfter="명"
                      style={{ width: 110 }}
                    />
                  </div>
                  <ScoreRow style={{ alignItems: 'center' }}>
                    <StyledInputNumber
                      min={0} max={100}
                      value={req.targetScore}
                      onChange={(v) => handleRequirementChange(dj.id, 'targetScore', Number(v) || 0)}
                      addonAfter="점"
                      style={{ width: 130 }}
                    />
                    <ScoreLabel $score={req.targetScore}>
                      {req.targetScore >= 80 ? '🟢 고역량' : req.targetScore >= 65 ? '🟡 중역량' : '🔴 기본'}
                      {' '}({req.targetScore}점)
                    </ScoreLabel>
                    <ScoreBar $score={req.targetScore} />
                  </ScoreRow>
                </ReqTableRow>
              );
            })}
          </RequirementsTable>

          {/* 합계 행 */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 24, padding: '14px 20px',
            background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', marginTop: 12,
            fontSize: 14
          }}>
            <span style={{ color: '#64748b' }}>선택된 직무: <strong style={{ color: '#0f172a' }}>{selectedDetails.length}개</strong></span>
            <span style={{ color: '#64748b' }}>총 필요 인원: <strong style={{ color: '#1e3a5f', fontSize: 16 }}>
              {selectedDetails.reduce((s, d) => s + getReq(d.id).headcount, 0)}명
            </strong></span>
            <span style={{ color: '#64748b' }}>평균 역량 스코어: <strong style={{ color: '#1e3a5f', fontSize: 16 }}>
              {selectedDetails.length > 0
                ? Math.round(selectedDetails.reduce((s, d) => s + getReq(d.id).targetScore, 0) / selectedDetails.length)
                : 0}점
            </strong></span>
          </div>

          <NavRow>
            <NavLeft>
              <Button onClick={() => setStep(2)}>이전</Button>
            </NavLeft>
            <Button type="primary" size="large"
              style={{ background: '#1e3a5f', borderColor: '#1e3a5f', paddingLeft: 28, paddingRight: 28 }}
              onClick={handleComplete}>
              ✅ 입력 완료 — 인력 배치 준비
            </Button>
          </NavRow>
        </StepCard>
      )}
    </Wizard>
  );
}
