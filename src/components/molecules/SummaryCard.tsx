import styled from 'styled-components';

const Card = styled.div<{ $color: string }>`
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: 4px solid ${({ $color }) => $color};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Value = styled.span<{ $color: string }>`
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: ${({ $color }) => $color};
`;

const Label = styled.span`
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.textMuted};
`;

interface Props {
  label: string;
  value: string;
  color: string;
}

export default function SummaryCard({ label, value, color }: Props) {
  return (
    <Card $color={color}>
      <Value $color={color}>{value}</Value>
      <Label>{label}</Label>
    </Card>
  );
}
