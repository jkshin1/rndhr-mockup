import styled from 'styled-components';
import type { TFTemplate } from '../../data/mockData';

const Card = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme, $active }) => $active ? '#f0f7ff' : theme.colors.cardBg};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: #f8faff;
    box-shadow: ${({ theme }) => theme.shadows.card};
  }
`;

const Name = styled.span<{ $active: boolean }>`
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: ${({ $active }) => $active ? 700 : 500};
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textPrimary};
`;

const SizeBadge = styled.span<{ $active: boolean }>`
  font-size: ${({ theme }) => theme.fontSize.md};
  font-weight: 600;
  padding: 2px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme, $active }) => $active ? theme.colors.primary : '#f1f5f9'};
  color: ${({ theme, $active }) => $active ? '#fff' : theme.colors.textSecondary};
`;

interface Props {
  template: TFTemplate;
  active: boolean;
  onClick: () => void;
}

export default function TFCard({ template, active, onClick }: Props) {
  return (
    <Card $active={active} onClick={onClick}>
      <Name $active={active}>{template.name}</Name>
      <SizeBadge $active={active}>~{template.totalHeadcount.toLocaleString()}명</SizeBadge>
    </Card>
  );
}
