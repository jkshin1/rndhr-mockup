import { useState } from 'react';
import { Button } from 'antd';
import styled from 'styled-components';
import TFCard from '../molecules/TFCard';
import JobCompetencyItem from '../molecules/JobCompetencyItem';
import MiddleJobBadge from '../atoms/MiddleJobBadge';
import type { TFTemplate } from '../../data/mockData';

const SOJA_JOBS = ['PI', 'Device', 'FA'];
const MIDDLE_ORDER = ['소자', '공정'] as const;

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
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

/* ── Job competencies ── */
const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const DetailTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const GroupBlock = styled.div<{ $type: '소자' | '공정' }>`
  border: 1px solid ${({ $type }) =>
    $type === '소자' ? '#bfdbfe' : '#fde68a'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const GroupHeader = styled.div<{ $type: '소자' | '공정' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: ${({ $type }) =>
    $type === '소자' ? '#eff6ff' : '#fffbeb'};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 700;
  color: ${({ theme, $type }) =>
    $type === '소자' ? theme.colors.soja.text : theme.colors.process.text};
`;

const CompList = styled.ul`
  list-style: none;
  padding: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  background: #fff;
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

export default function TFRequestPanel({ templates, onSelect, onRecommend }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = templates.find((t) => t.id === selectedId) ?? null;

  const handleClick = (t: TFTemplate) => {
    setSelectedId(t.id);
    onSelect(t);
  };

  return (
    <Panel>
      <div>
        <PanelTitle>Tech TF 구성 요청</PanelTitle>
        <PanelSubtitle>구성할 TF 유형을 선택하세요</PanelSubtitle>
      </div>

      <CardList>
        {templates.map((t) => (
          <TFCard
            key={t.id}
            template={t}
            active={selectedId === t.id}
            onClick={() => handleClick(t)}
          />
        ))}
      </CardList>

      {selected && (
        <DetailSection>
          <DetailTitle>{selected.name} · 직무별 필요 역량</DetailTitle>

          {MIDDLE_ORDER.map((mj) => {
            const items = selected.jobCompetencies.filter((jc) =>
              mj === '소자' ? SOJA_JOBS.includes(jc.subJob) : !SOJA_JOBS.includes(jc.subJob)
            );
            return (
              <GroupBlock key={mj} $type={mj}>
                <GroupHeader $type={mj}>
                  <MiddleJobBadge type={mj} />
                  {mj}
                </GroupHeader>
                <CompList>
                  {items.map((jc) => (
                    <JobCompetencyItem key={jc.subJob} competency={jc} />
                  ))}
                </CompList>
              </GroupBlock>
            );
          })}

          <SimulateButton type="primary" onClick={() => onRecommend(selected)}>
            인력 배치 시뮬레이션
          </SimulateButton>
        </DetailSection>
      )}
    </Panel>
  );
}
