import styled from 'styled-components';
import type { FunctionRiskLevel } from '../../data/mockData';

type RiskLevel = 'high' | 'medium' | 'low' | FunctionRiskLevel;

const Dot = styled.i<{ $level: RiskLevel }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ theme, $level }) => theme.colors.risk[$level].dot};
`;

interface Props {
  level: RiskLevel;
  className?: string;
}

export default function RiskDot({ level, className }: Props) {
  return <Dot $level={level} className={className} />;
}
