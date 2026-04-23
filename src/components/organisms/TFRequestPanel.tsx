import { useEffect, useMemo, useState } from 'react';
import { Button, Input, InputNumber, Select, Slider } from 'antd';
import styled from 'styled-components';
import TFCard from '../molecules/TFCard';
import MiddleJobBadge from '../atoms/MiddleJobBadge';
import SkillTag from '../atoms/SkillTag';
import {
  DEVICE_SUB_JOBS,
  PROCESS_SUB_JOBS,
  type CareerLevelRequirement,
  type MiddleJob,
  type TFTemplate,
} from '../../data/mockData';
import {
  buildScenarioTemplate,
  createTFScenarioRows,
  type TFScenarioCompetencyRow,
} from '../../data/tfScenario';

const { TextArea } = Input;
const MIDDLE_ORDER: MiddleJob[] = ['소자', '공정'];
const SUB_JOBS_BY_MIDDLE: Record<MiddleJob, readonly string[]> = {
  소자: DEVICE_SUB_JOBS,
  공정: PROCESS_SUB_JOBS,
};
const CAREER_JOB_CATALOG: Record<
  string,
  { unitJobs: string[]; detailJobs: string[] }
> = {
  PI: {
    unitJobs: ['공정 통합', '제품 통합', '수율 개선'],
    detailJobs: ['통합 플로우 설계', 'Lot 운영 최적화', '수율 저해 인자 해소'],
  },
  Device: {
    unitJobs: ['셀 구조 설계', '전기 특성', '회로 검증'],
    detailJobs: ['셀 구조 최적화', '전기적 특성 분석', '설계 검증'],
  },
  FA: {
    unitJobs: ['결함 분석', '신뢰성', '수율 분석'],
    detailJobs: ['SEM/TEM 분석', '가속 시험', '수율 저해 인자 분석'],
  },
  Photo공정: {
    unitJobs: ['EUV 패터닝', '오버레이', 'CD 관리'],
    detailJobs: ['EUV 패터닝 최적화', 'Overlay 안정화', 'CD 편차 개선'],
  },
  Etch공정: {
    unitJobs: ['식각 프로파일', '선택비', '플라즈마 진단'],
    detailJobs: ['HAR 식각 최적화', '식각 선택비 제어', '식각 균일도 안정화'],
  },
  Diffusion공정: {
    unitJobs: ['증착', '열처리', '계면 제어'],
    detailJobs: ['ALD 증착 최적화', '열처리 조건 설계', '계면 결함 저감'],
  },
  ThinFilm공정: {
    unitJobs: ['금속화', 'CMP', '배선 신뢰성'],
    detailJobs: ['금속 배선 형성', '평탄화 최적화', '배선 저항 저감'],
  },
  'C&C공정': {
    unitJobs: ['세정', '표면 개질', '오염 제어'],
    detailJobs: ['세정 레시피 최적화', '표면 활성화', '파티클 제어'],
  },
};

const DEFAULT_UNIT_JOBS = ['직무 운영', '기술 검증', '프로젝트 지원'];

function getUnitJobs(subJob: string): string[] {
  return CAREER_JOB_CATALOG[subJob]?.unitJobs ?? DEFAULT_UNIT_JOBS;
}

function getDetailJobs(subJob: string): string[] {
  return (
    CAREER_JOB_CATALOG[subJob]?.detailJobs ?? [`${subJob} 기획`, `${subJob} 검증`, `${subJob} 실행`]
  );
}

function getDefaultSubJob(middleJob: MiddleJob): string {
  return SUB_JOBS_BY_MIDDLE[middleJob][0] ?? '';
}

function getDefaultUnitJob(subJob: string): string {
  return getUnitJobs(subJob)[0] ?? DEFAULT_UNIT_JOBS[0];
}

function getDefaultDetailJob(subJob: string): string {
  return getDetailJobs(subJob)[0] ?? `${subJob} 기획`;
}

/* ── Layout ── */
const Panel = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const PanelTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.xxl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const PanelSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 4px 0 0;
  line-height: 1.6;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ScenarioSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`;

const SummaryCard = styled.div`
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  box-shadow: ${({ theme }) => theme.shadows.card};

  span {
    display: block;
    font-size: ${({ theme }) => theme.fontSize.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    margin-bottom: 4px;
  }

  strong {
    display: block;
    font-size: ${({ theme }) => theme.fontSize.xl};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const SeedBanner = styled.div<{ $variant: 'previous' | 'default' }>`
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ $variant }) => ($variant === 'previous' ? '#93c5fd' : '#bfdbfe')};
  background: ${({ $variant }) =>
    $variant === 'previous'
      ? 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 55%, #f8fafc 100%)'
      : 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)'};

  strong {
    display: block;
    font-size: ${({ theme }) => theme.fontSize.base};
    color: ${({ theme }) => theme.colors.textPrimary};
    margin-bottom: 4px;
  }

  p {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.base};
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.6;
  }
`;

const SeedBannerMeta = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 700;
`;

const GroupBlock = styled.div<{ $type: MiddleJob }>`
  border: 1px solid ${({ $type }) => ($type === '소자' ? '#bfdbfe' : '#fde68a')};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  background: #fff;
`;

const GroupHeader = styled.div<{ $type: MiddleJob }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: ${({ $type }) => ($type === '소자' ? '#eff6ff' : '#fffbeb')};
`;

const GroupHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const GroupHeaderMeta = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CompList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
`;

const ScenarioItem = styled.div`
  display: flex;
  gap: 14px;
  justify-content: space-between;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.cardBg};
`;

const ScenarioBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ScenarioTop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const SubJobName = styled.span`
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const MetaBadge = styled.span`
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: #f8fafc;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 600;
`;

const CustomBadge = styled(MetaBadge)`
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
`;

const Responsibility = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`;

const Skills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const CountPanel = styled.div`
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
`;

const HeadcountControlRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 78px;
  gap: 10px;
  align-items: center;
`;

const CountLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const CountHint = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.5;
`;

const AddSection = styled.div`
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.lg};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const SectionDesc = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const FullWidth = styled.div`
  grid-column: 1 / -1;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;

  span {
    font-size: ${({ theme }) => theme.fontSize.sm};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const ErrorText = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.risk.high.text};
`;

const SimulateButton = styled(Button)`
  && {
    width: 100%;
    height: 44px;
    font-size: ${({ theme }) => theme.fontSize.lg};
    font-weight: 700;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    color: #fff;

    &:hover, &:focus {
      background: ${({ theme }) => theme.colors.primaryHover} !important;
      border-color: ${({ theme }) => theme.colors.primaryHover} !important;
      color: #fff !important;
    }
  }
`;

interface Props {
  templates: TFTemplate[];
  onSelect: (template: TFTemplate) => void;
  onRecommend: (template: TFTemplate) => void;
}

interface AddFormState {
  middleJob: MiddleJob;
  subJob: string;
  unitJob: string;
  detailJob: string;
  responsibility: string;
  minCareerYears: number;
  averageTechTfYears: number;
  count: number;
}

const INITIAL_MIDDLE_JOB: MiddleJob = '소자';

const INITIAL_ADD_FORM: AddFormState = {
  middleJob: INITIAL_MIDDLE_JOB,
  subJob: getDefaultSubJob(INITIAL_MIDDLE_JOB),
  unitJob: getDefaultUnitJob(getDefaultSubJob(INITIAL_MIDDLE_JOB)),
  detailJob: getDefaultDetailJob(getDefaultSubJob(INITIAL_MIDDLE_JOB)),
  responsibility: '',
  minCareerYears: 3,
  averageTechTfYears: 3,
  count: 1,
};

function buildDefaultCareerLevelMap(minCareerYears: number): CareerLevelRequirement {
  return {
    CL2: minCareerYears,
    CL3: minCareerYears,
    CL4: minCareerYears,
    CL5: minCareerYears,
  };
}

interface SeedMessageState {
  variant: 'previous' | 'default';
  title: string;
  description: string;
}

const TF_SEQUENCE = [
  'Procyon',
  'Pollux',
  'Kapella',
  'Altair',
  'Adhara',
  'Big Dipper',
  'Pegasus',
  'Libra',
  'Leo',
] as const;

function getHeadcountSliderMax(...values: number[]): number {
  const maxValue = Math.max(10, ...values);
  return Math.ceil(maxValue / 5) * 5;
}

function getTFSequenceIndex(name: string): number {
  return TF_SEQUENCE.indexOf(name as (typeof TF_SEQUENCE)[number]);
}

function getPreviousTFName(name: string): string | null {
  const index = getTFSequenceIndex(name);
  if (index <= 0) return null;
  return TF_SEQUENCE[index - 1];
}

export default function TFRequestPanel({ templates, onSelect, onRecommend }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scenarioRows, setScenarioRows] = useState<TFScenarioCompetencyRow[]>([]);
  const [scenarioRowsByTemplate, setScenarioRowsByTemplate] = useState<Record<string, TFScenarioCompetencyRow[]>>({});
  const [seedMessage, setSeedMessage] = useState<SeedMessageState>({
    variant: 'default',
    title: '직전 TF 구성원 수 기준',
    description: '직전 TF 구성원 수를 기본값으로 불러오며, 첫 선택인 경우에는 선택한 TF의 기본 구성원 수로 시작합니다. 아래 슬라이더와 숫자 입력으로 세부 인원을 조정하세요.',
  });
  const [addForm, setAddForm] = useState<AddFormState>(INITIAL_ADD_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const selected = templates.find((template) => template.id === selectedId) ?? null;
  const orderedTemplates = useMemo(
    () =>
      [...templates].sort((a, b) => {
        const aIndex = getTFSequenceIndex(a.name);
        const bIndex = getTFSequenceIndex(b.name);
        if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      }),
    [templates]
  );

  const groupedRows = useMemo(
    () =>
      MIDDLE_ORDER.map((middleJob) => ({
        middleJob,
        rows: scenarioRows.filter((row) => row.middleJob === middleJob),
      })),
    [scenarioRows]
  );

  const subJobOptions = useMemo(
    () =>
      SUB_JOBS_BY_MIDDLE[addForm.middleJob].map((value) => ({
        value,
        label: value,
      })),
    [addForm.middleJob]
  );
  const unitJobOptions = useMemo(
    () => getUnitJobs(addForm.subJob).map((value) => ({ value, label: value })),
    [addForm.subJob]
  );
  const detailJobOptions = useMemo(
    () => getDetailJobs(addForm.subJob).map((value) => ({ value, label: value })),
    [addForm.subJob]
  );

  useEffect(() => {
    setAddForm((form) => {
      const nextSubJob = SUB_JOBS_BY_MIDDLE[form.middleJob]?.includes(form.subJob)
        ? form.subJob
        : getDefaultSubJob(form.middleJob);
      const unitJobs = getUnitJobs(nextSubJob);
      const nextUnitJob = unitJobs.includes(form.unitJob)
        ? form.unitJob
        : unitJobs[0] ?? DEFAULT_UNIT_JOBS[0];
      const detailJobs = getDetailJobs(nextSubJob);
      const nextDetailJob = detailJobs.includes(form.detailJob)
        ? form.detailJob
        : detailJobs[0] ?? `${nextSubJob} 기획`;

      if (
        nextSubJob === form.subJob &&
        nextUnitJob === form.unitJob &&
        nextDetailJob === form.detailJob
      ) {
        return form;
      }

      return {
        ...form,
        subJob: nextSubJob,
        unitJob: nextUnitJob,
        detailJob: nextDetailJob,
      };
    });
  }, [addForm.middleJob, addForm.subJob]);

  const totalHeadcount = scenarioRows.reduce((sum, row) => sum + row.count, 0);
  const customCount = scenarioRows.filter((row) => row.isCustom).length;
  const deltaFromTemplate = selected ? totalHeadcount - selected.totalHeadcount : 0;

  const handleClick = (nextTemplate: TFTemplate) => {
    const previousTFName = getPreviousTFName(nextTemplate.name);
    const previousTemplate = previousTFName
      ? orderedTemplates.find((template) => template.name === previousTFName) ?? null
      : null;
    const previousSeedRows = previousTemplate
      ? scenarioRowsByTemplate[previousTemplate.id] ?? createTFScenarioRows(previousTemplate)
      : undefined;
    const nextRows = createTFScenarioRows(nextTemplate, previousSeedRows);

    setSelectedId(nextTemplate.id);
    setScenarioRows(nextRows);
    setScenarioRowsByTemplate((prev) => ({
      ...prev,
      [nextTemplate.id]: nextRows,
    }));
    setSeedMessage(
      previousTFName && previousTemplate
        ? {
            variant: 'previous',
            title: '직전 TF 구성원 수 기준',
            description: `직전 TF인 ${previousTFName}의 구성원 수를 기본값으로 불러왔습니다. 아래 슬라이더와 숫자 입력으로 세부 인원을 튜닝하세요.`,
          }
        : previousTFName
        ? {
            variant: 'default',
            title: '직전 TF 구성원 수 기준',
            description: `직전 TF는 ${previousTFName}입니다. 현재 화면 데이터에는 해당 시나리오가 없어 선택한 TF의 기본 구성원 수로 시작합니다. 아래 슬라이더와 숫자 입력으로 세부 인원을 조정하세요.`,
          }
        : {
            variant: 'default',
            title: '직전 TF 구성원 수 기준',
            description: '해당 TF는 순서상 첫 TF이므로 선택한 TF의 기본 구성원 수로 시작합니다. 아래 슬라이더와 숫자 입력으로 세부 인원을 조정하세요.',
          }
    );
    setFormError(null);
    onSelect(nextTemplate);
  };

  const updateRow = (key: string, patch: Partial<TFScenarioCompetencyRow>) => {
    setScenarioRows((rows) => {
      const nextRows = rows.map((row) => (row.key === key ? { ...row, ...patch } : row));
      if (selectedId) {
        setScenarioRowsByTemplate((prev) => ({
          ...prev,
          [selectedId]: nextRows,
        }));
      }
      return nextRows;
    });
  };

  const handleAddCompetency = () => {
    if (!selected) return;

    const subJob = addForm.subJob.trim();
    const unitJob = addForm.unitJob.trim();
    const detailJob = addForm.detailJob.trim();
    const displaySubJob = `${addForm.middleJob} / ${subJob} / ${unitJob} / ${detailJob}`.trim();

    if (!subJob || !unitJob || !detailJob) {
      setFormError('중직무, 소직무, 단위직무, 세부직무를 모두 선택하세요.');
      return;
    }

    if (scenarioRows.some((row) => row.subJob.toLowerCase() === displaySubJob.toLowerCase())) {
      setFormError('같은 조합의 직무가 이미 존재합니다.');
      return;
    }

    setScenarioRows((rows) => {
      const baseMinCareerYears = Math.max(0, Math.round(addForm.minCareerYears));
      const averageTechTfYears = Math.max(0, Math.round(addForm.averageTechTfYears));
      const nextRows = [
        ...rows,
        {
          key: `custom:${displaySubJob}`,
          middleJob: addForm.middleJob,
          subJob: displaySubJob,
          requiredSkills: [unitJob, detailJob],
          responsibility: addForm.responsibility.trim() || `${detailJob} 신규 직무 대응`,
          minCareerYears: baseMinCareerYears,
          minCareerYearsByLevel: buildDefaultCareerLevelMap(baseMinCareerYears),
          averageTechTfYears,
          count: Math.max(0, Math.round(addForm.count)),
          targetCount: Math.max(0, Math.round(addForm.count)),
          targetScore: 74,
          baselineActualScore: 62,
          isCustom: true,
        } as TFScenarioCompetencyRow,
      ];
      if (selectedId) {
        setScenarioRowsByTemplate((prev) => ({
          ...prev,
          [selectedId]: nextRows,
        }));
      }
      return nextRows;
    });
    setAddForm(INITIAL_ADD_FORM);
    setFormError(null);
  };

  const handleMiddleJobChange = (middleJob: MiddleJob) => {
    const nextSubJob = getDefaultSubJob(middleJob);
    setAddForm((form) => ({
      ...form,
      middleJob,
      subJob: nextSubJob,
      unitJob: getDefaultUnitJob(nextSubJob),
      detailJob: getDefaultDetailJob(nextSubJob),
    }));
  };

  const handleSubJobChange = (subJob: string) => {
    setAddForm((form) => ({
      ...form,
      subJob,
      unitJob: getDefaultUnitJob(subJob),
      detailJob: getDefaultDetailJob(subJob),
    }));
  };

  const handleRecommend = () => {
    if (!selected) return;
    onRecommend(buildScenarioTemplate(selected, scenarioRows));
  };

  return (
    <Panel>
      <div>
        <PanelTitle>Tech TF 구성 요청</PanelTitle>
        <PanelSubtitle>
          TF를 선택한 뒤 직전 구성안을 초기값으로 받아 직무별 인원 수를 조정하고,
          필요 시 신규 직무까지 추가하세요.
        </PanelSubtitle>
      </div>

      <CardList>
        {orderedTemplates.map((template) => (
          <TFCard
            key={template.id}
            template={template}
            active={selectedId === template.id}
            onClick={() => handleClick(template)}
          />
        ))}
      </CardList>

      {selected && (
        <DetailSection>
          <ScenarioSummary>
            <SummaryCard>
              <span>시나리오 총 인원</span>
              <strong>{totalHeadcount.toLocaleString()}명</strong>
            </SummaryCard>
            <SummaryCard>
              <span>기준 대비 증감</span>
              <strong>{deltaFromTemplate >= 0 ? `+${deltaFromTemplate}` : deltaFromTemplate}명</strong>
            </SummaryCard>
            <SummaryCard>
              <span>추가한 신규 직무</span>
              <strong>{customCount}개</strong>
            </SummaryCard>
          </ScenarioSummary>

          <SeedBanner $variant={seedMessage.variant}>
            <SeedBannerMeta>
              {seedMessage.variant === 'previous' ? '직전 TF 기준' : '기본값 기준'}
            </SeedBannerMeta>
            <strong>{seedMessage.title}</strong>
            <p>{seedMessage.description}</p>
          </SeedBanner>

          {groupedRows.map(({ middleJob, rows }) => (
            <GroupBlock key={middleJob} $type={middleJob}>
              <GroupHeader $type={middleJob}>
                <GroupHeaderLeft>
                  <MiddleJobBadge type={middleJob} />
                  {middleJob}
                </GroupHeaderLeft>
                <GroupHeaderMeta>
                  {rows.length}개 직무 · {rows.reduce((sum, row) => sum + row.count, 0)}명
                </GroupHeaderMeta>
              </GroupHeader>

              <CompList>
                {rows.map((row) => (
                  <ScenarioItem key={row.key}>
                    <ScenarioBody>
                      <ScenarioTop>
                        <SubJobName>{row.subJob}</SubJobName>
                        <MetaBadge>평균 경력 {row.minCareerYears}년</MetaBadge>
                        <MetaBadge>평균 TF경험 {row.averageTechTfYears}년</MetaBadge>
                        <MetaBadge>권장 {row.targetCount}명</MetaBadge>
                        {row.isCustom && <CustomBadge>신규 직무</CustomBadge>}
                      </ScenarioTop>
                      <Responsibility>{row.responsibility}</Responsibility>
                      <Skills>
                        {row.requiredSkills.length > 0 ? (
                          row.requiredSkills.map((skill) => (
                            <SkillTag key={`${row.key}-${skill}`} skill={skill} />
                          ))
                        ) : (
                          <MetaBadge>필수 스킬 미정</MetaBadge>
                        )}
                      </Skills>
                    </ScenarioBody>

                    <CountPanel>
                      <CountLabel>구성원 수</CountLabel>
                      <HeadcountControlRow>
                        <Slider
                          min={0}
                          max={getHeadcountSliderMax(row.count, row.targetCount, row.targetCount + 5)}
                          value={row.count}
                          onChange={(value) => updateRow(row.key, { count: value })}
                        />
                        <InputNumber
                          min={0}
                          max={getHeadcountSliderMax(row.count, row.targetCount, row.targetCount + 5)}
                          value={row.count}
                          onChange={(value) => updateRow(row.key, { count: value ?? 0 })}
                          style={{ width: '100%' }}
                        />
                      </HeadcountControlRow>
                      <CountHint>
                        {row.targetCount > row.count
                          ? `현재 기준 ${row.targetCount - row.count}명 부족`
                          : '현재 기준 충원 수량 확보'}
                      </CountHint>
                      {row.isCustom && (
                        <Button
                          danger
                          onClick={() =>
                            setScenarioRows((rows) => {
                              const nextRows = rows.filter((item) => item.key !== row.key);
                              if (selectedId) {
                                setScenarioRowsByTemplate((prev) => ({
                                  ...prev,
                                  [selectedId]: nextRows,
                                }));
                              }
                              return nextRows;
                            })
                          }
                        >
                          삭제
                        </Button>
                      )}
                    </CountPanel>
                  </ScenarioItem>
                ))}
              </CompList>
            </GroupBlock>
          ))}

          <AddSection>
            <div>
              <SectionTitle>신규 직무 추가</SectionTitle>
              <SectionDesc>
                기존 TF 정의에 없는 직무도 추가할 수 있습니다. 추가 즉시 시나리오 인원 합계에 반영되며
                구성원 수도 바로 조정 가능합니다.
              </SectionDesc>
            </div>

            <FormGrid>
              <Field>
                <span>중직무</span>
                <Select<MiddleJob>
                  value={addForm.middleJob}
                  onChange={handleMiddleJobChange}
                  options={MIDDLE_ORDER.map((value) => ({ value, label: value }))}
                />
              </Field>

              <Field>
                <span>소직무</span>
                <Select<string>
                  value={addForm.subJob}
                  onChange={handleSubJobChange}
                  options={subJobOptions}
                />
              </Field>

              <Field>
                <span>단위직무</span>
                <Select<string>
                  value={addForm.unitJob}
                  onChange={(value) => setAddForm((form) => ({ ...form, unitJob: value }))}
                  options={unitJobOptions}
                />
              </Field>

              <Field>
                <span>세부직무</span>
                <Select<string>
                  value={addForm.detailJob}
                  onChange={(value) => setAddForm((form) => ({ ...form, detailJob: value }))}
                  options={detailJobOptions}
                />
              </Field>

              <Field>
                <span>평균 경력(년)</span>
                <InputNumber
                  min={0}
                  value={addForm.minCareerYears}
                  onChange={(value) => setAddForm((form) => ({ ...form, minCareerYears: value ?? 0 }))}
                  style={{ width: '100%' }}
                />
              </Field>

              <Field>
                <span>평균 TF경험 햇수(년)</span>
                <InputNumber
                  min={0}
                  value={addForm.averageTechTfYears}
                  onChange={(value) =>
                    setAddForm((form) => ({ ...form, averageTechTfYears: value ?? 0 }))
                  }
                  style={{ width: '100%' }}
                />
              </Field>

              <Field>
                <span>초기 구성원 수</span>
                <HeadcountControlRow>
                  <Slider
                    min={0}
                    max={getHeadcountSliderMax(addForm.count, 10, 15)}
                    value={addForm.count}
                    onChange={(value) => setAddForm((form) => ({ ...form, count: value }))}
                  />
                  <InputNumber
                    min={0}
                    max={getHeadcountSliderMax(addForm.count, 10, 15)}
                    value={addForm.count}
                    onChange={(value) => setAddForm((form) => ({ ...form, count: value ?? 0 }))}
                    style={{ width: '100%' }}
                  />
                </HeadcountControlRow>
              </Field>

              <FullWidth>
                <Field>
                  <span>역할 설명</span>
                  <TextArea
                    value={addForm.responsibility}
                    onChange={(event) => setAddForm((form) => ({ ...form, responsibility: event.target.value }))}
                    placeholder="이 직무가 TF에서 맡을 역할을 입력"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                  />
                </Field>
              </FullWidth>
            </FormGrid>

            {formError && <ErrorText>{formError}</ErrorText>}

            <Button onClick={handleAddCompetency}>신규 직무 추가</Button>
          </AddSection>

          <SimulateButton type="primary" onClick={handleRecommend}>
            인력 배치 시뮬레이션
          </SimulateButton>
        </DetailSection>
      )}
    </Panel>
  );
}
