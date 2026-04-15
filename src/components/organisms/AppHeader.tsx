import { Layout, Menu } from 'antd';
import styled from 'styled-components';
import type { MenuProps } from 'antd';

type PageType = 'tf' | 'org-setup';

const StyledHeader = styled(Layout.Header)`
  && {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: ${({ theme }) => theme.colors.headerBg};
    padding: 0 24px;
    height: 60px;
    flex-shrink: 0;
    gap: 24px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

const Symbol = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #c62828;
  border-radius: 6px;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: -0.5px;
  color: #fff;
`;

const Title = styled.h1`
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  white-space: nowrap;
`;

const Nav = styled(Menu)`
  && {
    background: transparent;
    border-bottom: none;
    flex: 1;
    justify-content: center;

    .ant-menu-item {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.18s ease;
      padding: 0 18px;
      line-height: 36px;
      height: 36px;
      margin: 0 4px;
    }

    .ant-menu-item:hover {
      color: rgba(255, 255, 255, 0.9) !important;
      background: rgba(255, 255, 255, 0.1) !important;
    }

    .ant-menu-item-selected {
      background: #fff !important;
      color: #0f172a !important;
      font-weight: 700 !important;
    }

    .ant-menu-item-selected:hover {
      background: #fff !important;
      color: #0f172a !important;
    }

    /* hide default antd active bar */
    .ant-menu-item::after {
      display: none !important;
    }
  }
`;

const InfoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
  min-width: 260px;
  justify-content: flex-end;
  flex-shrink: 0;
`;

const Dot = styled.span`
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  display: inline-block;
`;

interface Props {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  tfCount: number;
  totalHeadcount: number;
}

const menuItems: MenuProps['items'] = [
  { key: 'tf',        label: '🔬 Tech TF 구성' },
  { key: 'org-setup', label: '🏗️ 조직 신설 인력 배치' },
];

export default function AppHeader({ currentPage, onPageChange, tfCount, totalHeadcount }: Props) {
  return (
    <StyledHeader>
      <Logo>
        <Symbol>SK</Symbol>
        <Title>R&D 인력 배치 시스템</Title>
      </Logo>

      <Nav
        mode="horizontal"
        selectedKeys={[currentPage]}
        items={menuItems}
        onClick={({ key }) => onPageChange(key as PageType)}
      />

      <InfoArea>
        {currentPage === 'tf' ? (
          <>
            <span>전체 TF: {tfCount}개</span>
            <Dot />
            <span>총 배치 인력: {totalHeadcount.toLocaleString()}명</span>
          </>
        ) : (
          <span>조직 신설 인력 배치 시뮬레이션</span>
        )}
      </InfoArea>
    </StyledHeader>
  );
}
