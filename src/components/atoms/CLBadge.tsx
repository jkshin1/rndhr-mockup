import styled from 'styled-components';

type CLLevel = 'CL3' | 'CL4' | 'CL5';

const Badge = styled.span<{ $level: CLLevel }>`
  display: inline-block;
  padding: 1px 7px;
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 700;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1px solid;
  background: ${({ theme, $level }) => theme.colors[$level.toLowerCase() as 'cl3' | 'cl4' | 'cl5'].bg};
  color:      ${({ theme, $level }) => theme.colors[$level.toLowerCase() as 'cl3' | 'cl4' | 'cl5'].text};
  border-color:${({ theme, $level }) => theme.colors[$level.toLowerCase() as 'cl3' | 'cl4' | 'cl5'].border};
`;

interface Props {
  level: CLLevel;
}

export default function CLBadge({ level }: Props) {
  return <Badge $level={level}>{level}</Badge>;
}
