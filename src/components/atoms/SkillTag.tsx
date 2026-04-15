import { Tag } from 'antd';
import styled from 'styled-components';

const StyledTag = styled(Tag)`
  && {
    font-size: ${({ theme }) => theme.fontSize.xs};
    font-weight: 600;
    padding: 1px 7px;
    border-radius: ${({ theme }) => theme.borderRadius.full};
    border: 1px solid #bfdbfe;
    background: #eff6ff;
    color: #1e40af;
    margin: 0;
    line-height: 1.6;
    cursor: default;
  }
`;

interface Props {
  skill: string;
}

export default function SkillTag({ skill }: Props) {
  return <StyledTag>{skill}</StyledTag>;
}
