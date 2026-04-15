import styled from 'styled-components';

type JobType = '소자' | '공정' | 'TD' | string;

const Badge = styled.span<{ $type: JobType }>`
  display: inline-block;
  padding: 2px 8px;
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 700;
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  letter-spacing: 0.02em;
  background: ${({ theme, $type }) =>
    $type === '소자' || $type === 'TD'
      ? theme.colors.soja.bg
      : theme.colors.process.bg};
  color: ${({ theme, $type }) =>
    $type === '소자' || $type === 'TD'
      ? theme.colors.soja.text
      : theme.colors.process.text};
`;

interface Props {
  type: JobType;
  className?: string;
}

export default function MiddleJobBadge({ type, className }: Props) {
  return <Badge $type={type} className={className}>{type}</Badge>;
}
