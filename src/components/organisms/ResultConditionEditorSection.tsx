import { useEffect, useMemo, useState } from 'react';
import { Button, InputNumber, Slider } from 'antd';
import styled from 'styled-components';
import MiddleJobBadge from '../atoms/MiddleJobBadge';
import SummaryCard from '../molecules/SummaryCard';
import {
  buildScenarioTemplate,
  createTFScenarioRows,
  type TFScenarioCompetencyRow,
} from '../../data/tfScenario';
import type { MiddleJob, TFTemplate } from '../../data/mockData';

const CL_LEVELS: Array<keyof TFScenarioCompetencyRow['minCareerYearsByLevel']> = [
  'CL2',
  'CL3',
  'CL4',
  'CL5',
];
const CL_LABEL: Record<keyof TFScenarioCompetencyRow['minCareerYearsByLevel'], string> = {
  CL2: 'CL2',
  CL3: 'CL3',
  CL4: 'CL4',
  CL5: 'CL5',
};

const MIDDLE_ORDER: MiddleJob[] = ['소자', '공정'];

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Intro = styled.div`
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid #bfdbfe;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);

  strong {
    display: block;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin-bottom: 4px;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.6;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
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
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const GroupHeaderMeta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const RowList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ConditionRow = styled.div`
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr) 340px;
  gap: 14px;
  align-items: center;
  padding: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};

  &:first-child {
    border-top: none;
  }
`;

const JobCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const JobName = styled.strong`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const JobMeta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const HeadcountCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HeadcountTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const HeadcountLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const HeadcountControlRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 78px;
  gap: 10px;
  align-items: center;
`;

const CareerCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CareerSectionTitle = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const CareerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

const CareerField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CareerFieldLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.3;
`;

const TechTfCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TechTfLabel = styled(CareerFieldLabel)``;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

function getHeadcountSliderMax(...values: number[]): number {
  const maxValue = Math.max(10, ...values);
  return Math.ceil(maxValue / 5) * 5;
}

function clampValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

function areRowsEqual(currentRows: TFScenarioCompetencyRow[], baselineRows: TFScenarioCompetencyRow[]): boolean {
  if (currentRows.length !== baselineRows.length) return false;

  const baselineMap = new Map(baselineRows.map((row) => [row.key, row]));
  return currentRows.every((row) => {
    const baseline = baselineMap.get(row.key);
    if (!baseline) return false;

    const byLevelEqual = CL_LEVELS.every(
      (level) =>
        baseline.minCareerYearsByLevel[level] === row.minCareerYearsByLevel[level]
    );

    return (
      baseline &&
      baseline.count === row.count &&
      baseline.minCareerYears === row.minCareerYears &&
      byLevelEqual &&
      baseline.averageTechTfYears === row.averageTechTfYears
    );
  });
}

interface Props {
  template: TFTemplate;
  loading?: boolean;
  onRerun: (template: TFTemplate) => void;
}

export default function ResultConditionEditorSection({ template, loading = false, onRerun }: Props) {
  const [rows, setRows] = useState<TFScenarioCompetencyRow[]>(() => createTFScenarioRows(template));

  useEffect(() => {
    setRows(createTFScenarioRows(template));
  }, [template]);

  const baselineRows = createTFScenarioRows(template);
  const groupedRows = MIDDLE_ORDER.map((middleJob) => ({
    middleJob,
    rows: rows.filter((row) => row.middleJob === middleJob),
  })).filter((group) => group.rows.length > 0);

  const totalHeadcount = rows.reduce((sum, row) => sum + row.count, 0);
  const averageHeadcountDivider = Math.max(totalHeadcount, rows.length);
  const clCareerTotals = useMemo(() => {
    const initial = { CL2: 0, CL3: 0, CL4: 0, CL5: 0 } as Record<(typeof CL_LEVELS)[number], number>;
    const totals = rows.reduce((acc, row) => {
      const weight = Math.max(row.count, 1);
      CL_LEVELS.forEach((level) => {
        acc[level] += row.minCareerYearsByLevel[level] * weight;
      });
      return acc;
    }, initial);

    return {
      CL2: totals.CL2 / averageHeadcountDivider,
      CL3: totals.CL3 / averageHeadcountDivider,
      CL4: totals.CL4 / averageHeadcountDivider,
      CL5: totals.CL5 / averageHeadcountDivider,
    };
  }, [averageHeadcountDivider, rows]);

  const totalCl2Average = round1(clCareerTotals.CL2);
  const totalCl3Average = round1(clCareerTotals.CL3);
  const totalCl4Average = round1(clCareerTotals.CL4);
  const totalCl5Average = round1(clCareerTotals.CL5);

  const averageTechTfYears = useMemo(() => {
    const totals = rows.reduce((sum, row) => {
      const weight = Math.max(row.count, 1);
      return sum + row.averageTechTfYears * weight;
    }, 0);
    return averageHeadcountDivider > 0 ? totals / averageHeadcountDivider : 0;
  }, [averageHeadcountDivider, rows]);

  const isDirty = !areRowsEqual(rows, baselineRows);

  const getClCareerValue = (row: TFScenarioCompetencyRow, level: keyof TFScenarioCompetencyRow['minCareerYearsByLevel']) =>
    clampValue(row.minCareerYearsByLevel?.[level] ?? row.minCareerYears);

  const getMinCareerValue = (row: TFScenarioCompetencyRow) =>
    ((row.minCareerYearsByLevel.CL2 +
      row.minCareerYearsByLevel.CL3 +
      row.minCareerYearsByLevel.CL4 +
      row.minCareerYearsByLevel.CL5) /
      CL_LEVELS.length);

  const updateRow = (key: string, patch: Partial<TFScenarioCompetencyRow>) => {
    setRows((currentRows) =>
      currentRows.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  };

  const updateClCareerRow = (
    key: string,
    level: keyof TFScenarioCompetencyRow['minCareerYearsByLevel'],
    value: number
  ) => {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.key !== key) return row;
        return {
          ...row,
          minCareerYearsByLevel: {
            ...row.minCareerYearsByLevel,
            [level]: value,
          },
        };
      })
    );
  };

  const handleReset = () => {
    setRows(baselineRows);
  };

  const handleRerun = () => {
    onRerun(buildScenarioTemplate(template, rows));
  };

  return (
    <Wrap>
      <Intro>
        <strong>직무 별 인력 구성</strong>
        <p>
          현재 시뮬레이션 결과를 기준으로 직무별 구성원 수, CL2~CL5 직급별 평균 경력, 평균 TF경험 햇수를
          다시 조정한 뒤, 같은 화면에서 즉시 재분석할 수 있습니다.
        </p>
      </Intro>

      <SummaryGrid>
        <SummaryCard label="TF 구성 직무" value={`${rows.length}개`} color="#2563eb" />
        <SummaryCard label="총 구성원 수" value={`${totalHeadcount}명`} color="#0f766e" />
        <SummaryCard
          label="CL2 평균 경력"
          value={`${round1(totalCl2Average)}년`}
          color="#0369a1"
        />
        <SummaryCard
          label="CL3 평균 경력"
          value={`${round1(totalCl3Average)}년`}
          color="#0284c7"
        />
        <SummaryCard
          label="CL4 평균 경력"
          value={`${round1(totalCl4Average)}년`}
          color="#c2410c"
        />
        <SummaryCard
          label="CL5 평균 경력"
          value={`${round1(totalCl5Average)}년`}
          color="#7e22ce"
        />
        <SummaryCard
          label="평균 TF경험 햇수"
          value={`${round1(averageTechTfYears)}년`}
          color="#7c3aed"
        />
      </SummaryGrid>

      {groupedRows.map(({ middleJob, rows: groupRows }) => (
        <GroupBlock key={middleJob} $type={middleJob}>
          <GroupHeader $type={middleJob}>
            <GroupHeaderLeft>
              <MiddleJobBadge type={middleJob} />
              {middleJob}
            </GroupHeaderLeft>
            <GroupHeaderMeta>
              {groupRows.length}개 직무 · {groupRows.reduce((sum, row) => sum + row.count, 0)}명
            </GroupHeaderMeta>
          </GroupHeader>

          <RowList>
            {groupRows.map((row) => (
              <ConditionRow key={row.key}>
                <JobCell>
                  <JobName>{row.subJob}</JobName>
                  <JobMeta>
                    현재 권장 {row.targetCount}명 · 최소 경력 {getMinCareerValue(row).toFixed(1)}년,
                    평균 TF경험 햇수 {row.averageTechTfYears.toFixed(1)}년
                  </JobMeta>
                </JobCell>

                <HeadcountCell>
                  <HeadcountTop>
                    <HeadcountLabel>구성원 수</HeadcountLabel>
                  </HeadcountTop>
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
                </HeadcountCell>

                <CareerCell>
                  <CareerSectionTitle>직급별 평균 경력(년)</CareerSectionTitle>
                  <CareerGrid>
                    {CL_LEVELS.map((level) => (
                      <CareerField key={`${row.key}-${level}`}>
                        <CareerFieldLabel>{CL_LABEL[level]}</CareerFieldLabel>
                        <InputNumber
                          min={0}
                          max={40}
                          precision={1}
                          step={0.5}
                          value={getClCareerValue(row, level)}
                          onChange={(value) =>
                            updateClCareerRow(row.key, level, clampValue(value ?? 0))
                          }
                          style={{ width: '100%' }}
                        />
                      </CareerField>
                    ))}
                  </CareerGrid>
                  <TechTfCell>
                    <TechTfLabel>평균 TF경험 햇수(년)</TechTfLabel>
                    <InputNumber
                      min={0}
                      max={30}
                      precision={1}
                      step={0.5}
                      value={clampValue(row.averageTechTfYears)}
                      onChange={(value) =>
                        updateRow(row.key, { averageTechTfYears: clampValue(value ?? 0) })
                      }
                      style={{ width: '100%' }}
                    />
                  </TechTfCell>
                </CareerCell>
              </ConditionRow>
            ))}
          </RowList>
        </GroupBlock>
      ))}

      <Actions>
        <Button onClick={handleReset} disabled={!isDirty || loading}>
          변경 취소
        </Button>
        <Button type="primary" onClick={handleRerun} disabled={!isDirty} loading={loading}>
          조건 반영 후 다시 분석
        </Button>
      </Actions>
    </Wrap>
  );
}
