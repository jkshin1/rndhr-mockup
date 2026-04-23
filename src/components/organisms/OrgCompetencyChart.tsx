import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import HighchartsReact from 'highcharts-react-official';
import styled from 'styled-components';
import type { OrgPlacementResult } from '../../data/orgSetupSimulation';

const Wrap = styled.div``;

const GapSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fff7ed;
  border-radius: 8px;
  border: 1px solid #fed7aa;
`;

const GapLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #c2410c;
`;

const GapItem = styled.span`
  font-size: 11px;
  padding: 2px 8px;
  background: #fff;
  border: 1px solid #fed7aa;
  border-radius: 999px;
  color: #7c3aed;
  strong { color: #be123c; }
`;

interface Props {
  placements: OrgPlacementResult[];
  compact?: boolean;
}

export default function OrgCompetencyChart({ placements, compact }: Props) {
  const categories = placements.map((p) => p.detailJobName);
  const targetScores = placements.map((p) => p.targetScore);
  const actualScores = placements.map((p) => p.avgPlacedScore);
  const gaps = placements.map((_, i) => targetScores[i] - actualScores[i]);
  const hasGap = gaps.some((g) => g > 0);
  const height = compact ? 300 : 380;

  const options: Highcharts.Options = {
    chart: {
      polar: true,
      type: 'areaspline',
      height,
      margin: compact ? [10, 10, 50, 10] : [20, 20, 60, 20],
      animation: false,
    },
    title: { text: undefined },
    pane: { size: compact ? '68%' : '72%' },
    xAxis: {
      categories,
      tickmarkPlacement: 'on',
      lineWidth: 0,
      labels: { style: { fontSize: compact ? '10px' : '12px', fontWeight: '600', color: '#374151' } },
    },
    yAxis: {
      gridLineInterpolation: 'polygon',
      min: 0,
      max: 100,
      tickInterval: 25,
      labels: { enabled: !compact, style: { fontSize: '10px', color: '#9ca3af' } },
      gridLineColor: '#e5e7eb',
    },
    tooltip: {
      shared: true,
      useHTML: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter(this: any) {
        const idx = this.points?.[0]?.point.x ?? 0;
        const name = categories[idx];
        const target = targetScores[idx], actual = actualScores[idx];
        const gap = target - actual;
        const gapColor = gap > 0 ? '#ef4444' : '#16a34a';
        const gapText = gap > 0 ? `▼ 부족 ${gap}pt` : `▲ 충족 ${Math.abs(gap)}pt`;
        return `<div style="font-size:12px;line-height:1.7"><b>${name}</b><br/>
          <span style="color:#f97316">● 필요</span>: <b>${target}</b><br/>
          <span style="color:#2563eb">● 배치 후</span>: <b>${actual}</b><br/>
          <span style="color:${gapColor};font-weight:700">${gapText}</span></div>`;
      },
    },
    legend: {
      enabled: true,
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      itemStyle: { fontSize: '11px', fontWeight: '600' },
      symbolRadius: 6,
    },
    credits: { enabled: false },
    series: [
      {
        type: 'areaspline', name: '필요 역량', data: targetScores, pointPlacement: 'on',
        color: '#f97316', fillOpacity: 0.06, lineWidth: 2.5, dashStyle: 'ShortDash', zIndex: 2,
        marker: { enabled: true, symbol: 'diamond', radius: 4, fillColor: '#f97316', lineWidth: 0 },
      },
      {
        type: 'areaspline', name: '배치 후 역량', data: actualScores, pointPlacement: 'on',
        color: '#2563eb', fillOpacity: 0.18, lineWidth: 3, dashStyle: 'Solid', zIndex: 3,
        marker: { enabled: true, symbol: 'circle', radius: 4, fillColor: '#fff', lineColor: '#2563eb', lineWidth: 2 },
      },
    ],
  };

  const gapSummary = categories
    .map((name, i) => ({ name, gap: gaps[i] }))
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  return (
    <Wrap>
      <HighchartsReact highcharts={Highcharts} options={options} />
      {!compact && hasGap && (
        <GapSummary>
          <GapLabel>역량 Gap 상위</GapLabel>
          {gapSummary.map(({ name, gap }) => (
            <GapItem key={name}>{name} <strong>-{gap}pt</strong></GapItem>
          ))}
        </GapSummary>
      )}
    </Wrap>
  );
}
