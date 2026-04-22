import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import styled from 'styled-components';
import { analyzeTemplateCareer } from '../../data/tfCareerAnalysis';
import type { TFTemplate } from '../../data/mockData';

const Wrap = styled.div``;

const GapSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
  padding: 8px 12px;
  background: #eff6ff;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
`;

const GapLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #1d4ed8;
`;

const GapItem = styled.span`
  font-size: 11px;
  padding: 2px 8px;
  background: #fff;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  color: #1e3a5f;

  strong {
    color: #be123c;
  }
`;

interface Props {
  template: TFTemplate;
  compact?: boolean;
}

export default function TFCareerChart({ template, compact }: Props) {
  const metrics = analyzeTemplateCareer(template);
  const categories = metrics.map((metric) => metric.subJob);
  const requiredData = metrics.map((metric) => metric.requiredAvgCareerYears);
  const actualData = metrics.map((metric) => metric.actualAvgCareerYears);
  const maxCareer = Math.max(...requiredData, ...actualData, 10);
  const chartMax = Math.ceil((maxCareer + 1) / 2) * 2;
  const height = compact ? 300 : 360;

  const options: Highcharts.Options = {
    chart: {
      type: 'column',
      height,
      margin: compact ? [56, 10, 56, 30] : [20, 20, 60, 40],
      animation: false,
    },
    title: { text: undefined },
    xAxis: {
      categories,
      labels: {
        style: {
          fontSize: compact ? '10px' : '12px',
          fontWeight: '600',
          color: '#374151',
        },
        y: compact ? 28 : 18,
      },
    },
    yAxis: {
      min: 0,
      max: chartMax,
      tickInterval: 2,
      title: { text: undefined },
      labels: { style: { fontSize: '10px', color: '#64748b' } },
      gridLineColor: '#e5e7eb',
    },
    tooltip: {
      shared: true,
      useHTML: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter(this: any) {
        const index = this.points?.[0]?.point.index ?? 0;
        const metric = metrics[index];
        return `
          <div style="font-size:12px;line-height:1.7">
            <b>${metric.subJob}</b><br/>
            <span style="color:#2563eb">● 요구 평균 경력</span>: <b>${metric.requiredAvgCareerYears.toFixed(1)}년</b><br/>
            <span style="color:#0f766e">● 배치 평균 경력</span>: <b>${metric.actualAvgCareerYears.toFixed(1)}년</b><br/>
            <span style="color:#64748b">기본 경력 평균</span>: ${metric.baseAvgCareerYears.toFixed(1)}년<br/>
            <span style="color:#64748b">Tech Platform 가중</span>: +${metric.platformAdjustmentYears.toFixed(1)}년<br/>
            <span style="color:#64748b">신규 요소기술 셋업 가중</span>: +${metric.nuddAdjustmentYears.toFixed(1)}년<br/>
            <span style="color:#64748b">이전 Tech TF 경험자</span>: ${Math.round(metric.techTfExperiencedRate * 100)}%<br/>
            <span style="color:#64748b">추가 숙련 인력 요구</span>: +${Math.round(metric.additionalTechTfRequiredRate * 100)}%p<br/>
            <span style="color:#64748b">리더 경험</span>: 팀장 ${metric.teamLeadExperiencedCount} / Part장 ${metric.partLeadExperiencedCount} / Module장 ${metric.moduleLeadExperiencedCount}
          </div>
        `;
      },
    },
    legend: {
      enabled: true,
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'top',
      y: compact ? -6 : 0,
      itemStyle: { fontSize: '11px', fontWeight: '600' },
      symbolRadius: 6,
      margin: compact ? 10 : 16,
    },
    plotOptions: {
      column: {
        borderRadius: 4,
        borderWidth: 0,
        groupPadding: 0.18,
        pointPadding: 0.06,
        dataLabels: {
          enabled: true,
          format: '{y:.1f}년',
          style: { fontSize: '10px', fontWeight: '600', color: '#374151' },
        },
      },
    },
    credits: { enabled: false },
    series: [
      {
        type: 'column',
        name: '요구 평균 경력',
        data: requiredData,
        color: '#2563eb',
      },
      {
        type: 'column',
        name: '배치 평균 경력',
        data: actualData,
        color: '#0f766e',
      },
    ],
  };

  const gapSummary = metrics
    .filter((metric) => metric.careerGap > 0)
    .sort((a, b) => b.careerGap - a.careerGap)
    .slice(0, 3);

  return (
    <Wrap>
      <HighchartsReact highcharts={Highcharts} options={options} />
      {!compact && gapSummary.length > 0 && (
        <GapSummary>
          <GapLabel>경력 Gap 상위</GapLabel>
          {gapSummary.map((metric) => (
            <GapItem key={metric.subJob}>
              {metric.subJob} <strong>-{metric.careerGap.toFixed(1)}년</strong>
            </GapItem>
          ))}
        </GapSummary>
      )}
    </Wrap>
  );
}
