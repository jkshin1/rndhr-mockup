import { Tag } from 'antd';
import styled from 'styled-components';

type ActionType = '신규 채용' | '코칭·육성' | '현 수준 유지';

const ACTION_META: Record<ActionType, { icon: string; color: string; bg: string; border: string }> = {
  '신규 채용':   { icon: '👤', color: '#be123c', bg: '#fef2f2', border: '#fecaca' },
  '코칭·육성':  { icon: '📚', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  '현 수준 유지':{ icon: '✅', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
};

const StyledTag = styled(Tag)<{ $action: ActionType }>`
  && {
    font-size: ${({ theme }) => theme.fontSize.xs};
    font-weight: 600;
    padding: 2px 8px;
    border-radius: ${({ theme }) => theme.borderRadius.full};
    border: 1px solid ${({ $action }) => ACTION_META[$action].border};
    background: ${({ $action }) => ACTION_META[$action].bg};
    color: ${({ $action }) => ACTION_META[$action].color};
    margin: 0;
    cursor: default;
  }
`;

interface Props {
  action: ActionType;
}

export default function ActionPill({ action }: Props) {
  const meta = ACTION_META[action];
  return (
    <StyledTag $action={action}>
      {meta.icon} {action}
    </StyledTag>
  );
}
