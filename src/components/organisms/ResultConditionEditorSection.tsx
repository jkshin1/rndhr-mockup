import { useEffect, useState } from 'react';
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

const MIDDLE_ORDER: MiddleJob[] = ['소자', '공정'];

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

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const GroupHeaderMeta = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const RowList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ConditionRow = styled.div`
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr) 108px;
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
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const JobMeta = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs};
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
  font-size: ${({ theme }) => theme.fontSize.sm};
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
  gap: 8px;

  span {
    font-size: ${({ theme }) => theme.fontSize.sm};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

function getHeadcountSliderMax(...values: number[]): number {
  const maxValue = Math.max(10, ...values);
  return Math.ceil(maxValue / 5) * 5;
}

function areRowsEqual(currentRows: TFScenarioCompetencyRow[], baselineRows: TFScenarioCompetencyRow[]): boolean {
  if (currentRows.length !== baselineRows.length) return false;

  const baselineMap = new Map(baselineRows.map((row) => [row.key, row]));
  return currentRows.every((row) => {
    const baseline = baselineMap.get(row.key);
    return (
      baseline &&
      baseline.count === row.count &&
      baseline.minCareerYears === row.minCareerYears
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
  const averageCareerYears =
    rows.length > 0
      ? rows.reduce((sum, row) => sum + row.minCareerYears, 0) / rows.length
      : 0;
  const isDirty = !areRowsEqual(rows, baselineRows);

  const updateRow = (key: string, patch: Partial<TFScenarioCompetencyRow>) => {
    setRows((currentRows) =>
      currentRows.map((row) => (row.key === key ? { ...row, ...patch } : row))
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
        <strong>결과 조건 변경</strong>
        <p>
          현재 시뮬레이션 결과를 기준으로 직무별 구성원 수와 최소 경력을 다시 조정한 뒤,
          같은 화면에서 즉시 재분석할 수 있습니다.
        </p>
      </Intro>

      <SummaryGrid>
        <SummaryCard label="편집 대상 직무" value={`${rows.length}개`} color="#2563eb" />
        <SummaryCard label="총 구성원 수" value={`${totalHeadcount}명`} color="#0f766e" />
        <SummaryCard label="평균 최소 경력" value={`${averageCareerYears.toFixed(1)}년`} color="#ea580c" />
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
                  <JobMeta>현재 권장 {row.targetCount}명 · 최소 경력 {row.minCareerYears}년 기준</JobMeta>
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
                  <span>최소 경력(년)</span>
                  <InputNumber
                    min={0}
                    max={30}
                    value={row.minCareerYears}
                    onChange={(value) => updateRow(row.key, { minCareerYears: value ?? 0 })}
                    style={{ width: '100%' }}
                  />
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
