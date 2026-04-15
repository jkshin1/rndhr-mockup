import styled from 'styled-components';
import RiskDot from '../atoms/RiskDot';

type RiskLevel = 'high' | 'medium' | 'low';

const Chip = styled.span<{ $level: RiskLevel }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 700;
  color: ${({ theme, $level }) => theme.colors.risk[$level].text};
`;

interface Props {
  level: RiskLevel;
  className?: string;
}

export default function RiskChip({ level, className }: Props) {
  const labels: Record<RiskLevel, string> = { high: '고위험', medium: '중위험', low: '저위험' };
  return (
    <Chip $level={level} className={className}>
      <RiskDot level={level} />
      {labels[level]}
    </Chip>
  );
}
