import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import styled from 'styled-components';
import { getMiddleJobBySubJob, getOrderedTfSubJobs, type TFTemplate } from '../../data/mockData';

const COLOR_MAP: Record<string, string> = {
  PI: '#1d4ed8', Device: '#2563eb', FA: '#60a5fa',
  'Photo공정': '#b45309', 'Etch공정': '#d97706', 'Diffusion공정': '#f59e0b',
  'ThinFilm공정': '#fbbf24', 'C&C공정': '#fed7aa',
};

function getDistributionColor(subJob: string, middleJob: string, index: number): string {
  const known = COLOR_MAP[subJob];
  if (known) return known;

  const customSoja = ['#0284c7', '#0ea5e9', '#38bdf8'];
  const customProcess = ['#ea580c', '#f97316', '#fb923c'];
  const palette = middleJob === '공정' ? customProcess : customSoja;

  return palette[index % palette.length];
}

const Wrap = styled.div``;

const Summary = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const GroupBadge = styled.div<{ $type: '소자' | '공정' | 'total' }>`
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  background: ${({ $type }) =>
    $type === '소자' ? '#eff6ff' : $type === '공정' ? '#fffbeb' : '#f8fafc'};
  border: 1px solid ${({ $type }) =>
    $type === '소자' ? '#bfdbfe' : $type === '공정' ? '#fde68a' : '#e2e8f0'};

  span { display: block; font-size: 11px; font-weight: 600;
    color: ${({ $type }) => $type === '소자' ? '#1e40af' : $type === '공정' ? '#b45309' : '#64748b'}; }
  strong { display: block; font-size: 18px; font-weight: 700; margin: 2px 0;
    color: ${({ $type }) => $type === '소자' ? '#1e40af' : $type === '공정' ? '#b45309' : '#0f172a'}; }
  small { font-size: 10px; color: #94a3b8; }
`;

interface Props {
  template: TFTemplate;
  compact?: boolean;
}

export default function JobDistributionChart({ template, compact }: Props) {
  const { jobDistribution, totalHeadcount } = template;
  const orderedSubJobs = getOrderedTfSubJobs(template);
  const sorted = orderedSubJobs.map((sj) => {
    const found = jobDistribution.find((d) => d.subJob === sj);
    return {
      subJob: sj,
      count: found?.count ?? 0,
      middleJob: found?.middleJob ?? getMiddleJobBySubJob(sj),
    };
  });
  const categories = sorted.map((d) => d.subJob);
  const data = sorted.map((d, index) => ({
    y: d.count,
    color: getDistributionColor(d.subJob, d.middleJob, index),
  }));
  const sojaTotal = sorted.filter((d) => d.middleJob === '소자').reduce((s, d) => s + d.count, 0);
  const gongTotal = sorted.filter((d) => d.middleJob === '공정').reduce((s, d) => s + d.count, 0);
  const height = compact ? 300 : 360;
  const processStart = sorted.findIndex((d) => d.middleJob === '공정');
  const hasSoja = sorted.some((d) => d.middleJob === '소자');
  const hasProcess = processStart >= 0;
  const sojaEnd = hasProcess ? processStart - 1 : sorted.length - 1;

  const options: Highcharts.Options = {
    chart: { type: 'bar', height, margin: compact ? [8, 70, 48, 120] : [20, 80, 56, 120], animation: false },
    title: { text: undefined },
    xAxis: {
      categories,
      title: { text: null },
      labels: { style: { fontSize: compact ? '11px' : '12px', fontWeight: '600' } },
      plotBands: [
        ...(hasSoja ? [{
          from: -0.5,
          to: sojaEnd + 0.5,
          color: 'rgba(37,99,235,0.05)',
          label: { text: '소자', align: 'left' as const, x: -110, style: { fontSize: '11px', fontWeight: '700', color: '#1d4ed8' } },
        }] : []),
        ...(hasProcess ? [{
          from: processStart - 0.5,
          to: sorted.length - 0.5,
          color: 'rgba(180,83,9,0.05)',
          label: { text: '공정', align: 'left' as const, x: -110, style: { fontSize: '11px', fontWeight: '700', color: '#b45309' } },
        }] : []),
      ],
      plotLines: hasSoja && hasProcess
        ? [{ value: processStart - 0.5, color: '#cbd5e1', width: 1, dashStyle: 'Dot' }]
        : [],
    },
    yAxis: { min: 0, title: { text: undefined }, labels: { style: { fontSize: '10px' }, y: 14 }, tickPixelInterval: 50 },
    legend: { enabled: false },
    tooltip: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter(this: any) {
        const cat = categories[this.point.x as number];
        const mj = sorted[this.point.x as number]?.middleJob;
        return `<b>${mj} › ${cat}</b><br/>${this.y}명`;
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 3, borderWidth: 0,
        dataLabels: { enabled: true, format: '{y}명', style: { fontSize: '10px', fontWeight: '600', color: '#374151' } },
      },
    },
    credits: { enabled: false },
    series: [{ type: 'bar', name: '인원', data }],
  };

  return (
    <Wrap>
      {!compact && (
        <Summary>
          <GroupBadge $type="소자"><span>소자</span><strong>{sojaTotal}명</strong><small>PI · Device · FA</small></GroupBadge>
          <GroupBadge $type="공정"><span>공정</span><strong>{gongTotal}명</strong><small>Photo · Etch · Diffusion · ThinFilm · C&C</small></GroupBadge>
          <GroupBadge $type="total"><span>합계</span><strong>{totalHeadcount.toLocaleString()}명</strong><small>전체 배치 인원</small></GroupBadge>
        </Summary>
      )}
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Wrap>
  );
}
