import styled from 'styled-components';
import SkillTag from '../atoms/SkillTag';
import type { JobCompetency } from '../../data/mockData';

const Item = styled.li`
  padding: 12px 14px;
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SubJobName = styled.span`
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const CareerBadge = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.pageBg};
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Responsibility = styled.p`
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

const Skills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

interface Props {
  competency: JobCompetency;
}

export default function JobCompetencyItem({ competency }: Props) {
  return (
    <Item>
      <Top>
        <SubJobName>{competency.subJob}</SubJobName>
        <CareerBadge>경력 {competency.minCareerYears}년↑</CareerBadge>
      </Top>
      <Responsibility>{competency.responsibility}</Responsibility>
      <Skills>
        {competency.requiredSkills.map((s) => (
          <SkillTag key={s} skill={s} />
        ))}
      </Skills>
    </Item>
  );
}
