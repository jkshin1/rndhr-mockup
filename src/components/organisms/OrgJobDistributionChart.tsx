import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import styled from 'styled-components';
import type { OrgPlacementResult } from '../../data/orgSetupSimulation';
import type { OrgSetupResult } from '../../data/orgSetupData';

const Wrap = styled.div``;

const Summary = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const GroupBadge = styled.div<{ $type: 'request' | 'placed' | 'total' }>`
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  background: ${({ $type }) =>
    $type === 'request' ? '#eff6ff' : $type === 'placed' ? '#f0fdf4' : '#f8fafc'};
  border: 1px solid ${({ $type }) =>
    $type === 'request' ? '#bfdbfe' : $type === 'placed' ? '#bbf7d0' : '#e2e8f0'};

  span { display: block; font-size: 11px; font-weight: 600;
    color: ${({ $type }) => $type === 'request' ? '#1e40af' : $type === 'placed' ? '#15803d' : '#64748b'}; }
  strong { display: block; font-size: 18px; font-weight: 700; margin: 2px 0;
    color: ${({ $type }) => $type === 'request' ? '#1e40af' : $type === 'placed' ? '#15803d' : '#0f172a'}; }
  small { font-size: 10px; color: #94a3b8; }
`;

interface Props {
  placements: OrgPlacementResult[];
  setupInput: OrgSetupResult;
  compact?: boolean;
}

export default function OrgJobDistributionChart({ placements, setupInput, compact }: Props) {
  const categories = placements.map((p) => p.detailJobName);
  const requested = placements.map((p) => p.requestedHeadcount);
  const placed = placements.map((p) => p.candidates.length);

  const totalRequested = requested.reduce((s, v) => s + v, 0);
  const totalPlaced = placed.reduce((s, v) => s + v, 0);
  const shortage = Math.max(0, totalRequested - totalPlaced);

  const rowHeight = compact ? 34 : 40;
  const height = Math.max(compact ? 240 : 300, categories.length * rowHeight + (compact ? 48 : 72));

  const options: Highcharts.Options = {
    chart: {
      type: 'bar',
      height,
      margin: compact ? [8, 40, 36, 120] : [20, 60, 56, 150],
      animation: false,
    },
    title: { text: undefined },
    xAxis: {
      categories,
      title: { text: null },
      labels: { style: { fontSize: compact ? '11px' : '12px', fontWeight: '600' } },
    },
    yAxis: {
      min: 0,
      title: { text: undefined },
      labels: { style: { fontSize: '10px' }, y: 14 },
      allowDecimals: false,
      tickPixelInterval: 50,
    },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
      itemStyle: { fontSize: '11px', fontWeight: '600' },
      symbolRadius: 4,
    },
    tooltip: {
      shared: true,
      useHTML: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter(this: any) {
        const idx = this.points?.[0]?.point.x ?? 0;
        const req = requested[idx];
        const act = placed[idx];
        const gap = req - act;
        const gapColor = gap > 0 ? '#ef4444' : '#16a34a';
        const gapText = gap > 0 ? `▼ 미충원 ${gap}명` : `✓ 충원 완료`;
        return `<div style="font-size:12px;line-height:1.7"><b>${categories[idx]}</b><br/>
          <span style="color:#6366f1">● 요청</span>: <b>${req}명</b><br/>
          <span style="color:#16a34a">● 배치</span>: <b>${act}명</b><br/>
          <span style="color:${gapColor};font-weight:700">${gapText}</span></div>`;
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 3,
        borderWidth: 0,
        groupPadding: 0.1,
        pointPadding: 0.05,
        dataLabels: {
          enabled: true,
          format: '{y}명',
          style: { fontSize: '10px', fontWeight: '600', color: '#374151' },
        },
      },
    },
    credits: { enabled: false },
    series: [
      { type: 'bar', name: '요청 인원', data: requested, color: '#6366f1' },
      { type: 'bar', name: '배치 인원', data: placed, color: '#16a34a' },
    ],
  };

  return (
    <Wrap>
      {!compact && (
        <Summary>
          <GroupBadge $type="request">
            <span>요청 인원</span>
            <strong>{totalRequested}명</strong>
            <small>{setupInput.subJobLabel} · 세부 직무 {placements.length}개</small>
          </GroupBadge>
          <GroupBadge $type="placed">
            <span>배치 인원</span>
            <strong>{totalPlaced}명</strong>
            <small>충원율 {totalRequested > 0 ? Math.round((totalPlaced / totalRequested) * 100) : 0}%</small>
          </GroupBadge>
          <GroupBadge $type="total">
            <span>미충원</span>
            <strong>{shortage}명</strong>
            <small>{shortage > 0 ? '추가 확보 필요' : '전 직무 충원 완료'}</small>
          </GroupBadge>
        </Summary>
      )}
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Wrap>
  );
}
