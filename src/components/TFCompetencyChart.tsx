import Highcharts from "highcharts";
import "highcharts/highcharts-more";
import HighchartsReact from "highcharts-react-official";
import type { TFTemplate } from "../data/mockData";

const SUB_JOBS = [
  "PI", "Device", "FA",
  "Photo공정", "Etch공정", "Diffusion공정", "ThinFilm공정", "C&C공정",
];

interface Props {
  template: TFTemplate;
  compact?: boolean;
}

export default function TFCompetencyChart({ template, compact }: Props) {
  const targetScores = SUB_JOBS.map((sj) =>
    template.targetCompetencyScores.find((c) => c.subJob === sj)?.score ?? 0
  );
  const actualScores = SUB_JOBS.map((sj) =>
    template.competencyScores.find((c) => c.subJob === sj)?.score ?? 0
  );

  // 점수 차이 계산 (gap 표시용)
  const gaps = SUB_JOBS.map((sj, i) => targetScores[i] - actualScores[i]);
  const hasGap = gaps.some((g) => g > 0);

  const height = compact ? 300 : 380;

  const options: Highcharts.Options = {
    chart: {
      polar: true,
      type: "areaspline",
      height,
      margin: compact ? [10, 10, 50, 10] : [20, 20, 60, 20],
      animation: false,
    },
    title: { text: undefined },
    pane: { size: compact ? "68%" : "72%" },
    xAxis: {
      categories: SUB_JOBS,
      tickmarkPlacement: "on",
      lineWidth: 0,
      labels: {
        style: { fontSize: compact ? "10px" : "12px", fontWeight: "600", color: "#374151" },
      },
    },
    yAxis: {
      gridLineInterpolation: "polygon",
      min: 0,
      max: 100,
      tickInterval: 25,
      labels: {
        enabled: !compact,
        style: { fontSize: "10px", color: "#9ca3af" },
      },
      gridLineColor: "#e5e7eb",
    },
    tooltip: {
      shared: true,
      useHTML: true,
      formatter(this: Highcharts.TooltipFormatterContextObject) {
        const idx = this.points?.[0]?.point.x ?? 0;
        const sj = SUB_JOBS[idx];
        const target = targetScores[idx];
        const actual = actualScores[idx];
        const gap = target - actual;
        const gapColor = gap > 0 ? "#ef4444" : "#16a34a";
        const gapText = gap > 0 ? `▼ 부족 ${gap}pt` : `▲ 충족 ${Math.abs(gap)}pt`;
        return `
          <div style="font-size:12px;line-height:1.7">
            <b style="font-size:13px">${sj}</b><br/>
            <span style="color:#f97316">● 필요 역량</span>: <b>${target}</b><br/>
            <span style="color:#2563eb">● 배치 후 역량</span>: <b>${actual}</b><br/>
            <span style="color:${gapColor};font-weight:700">${gapText}</span>
          </div>`;
      },
    },
    legend: {
      enabled: true,
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
      itemStyle: { fontSize: "11px", fontWeight: "600" },
      symbolRadius: 6,
    },
    credits: { enabled: false },
    series: [
      {
        type: "areaspline",
        name: "필요 역량",
        data: targetScores,
        pointPlacement: "on",
        color: "#f97316",
        fillOpacity: 0.06,
        lineWidth: 2.5,
        dashStyle: "ShortDash",
        zIndex: 2,
        marker: {
          enabled: true,
          symbol: "diamond",
          radius: 4,
          fillColor: "#f97316",
          lineWidth: 0,
        },
      },
      {
        type: "areaspline",
        name: "배치 후 역량",
        data: actualScores,
        pointPlacement: "on",
        color: "#2563eb",
        fillOpacity: 0.18,
        lineWidth: 3,
        dashStyle: "Solid",
        zIndex: 3,
        marker: {
          enabled: true,
          symbol: "circle",
          radius: 4,
          fillColor: "#fff",
          lineColor: "#2563eb",
          lineWidth: 2,
        },
      },
    ],
  };

  // gap 요약 뱃지 계산
  const gapSummary = SUB_JOBS.map((sj, i) => ({ sj, gap: gaps[i] }))
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  return (
    <div className="tf-competency">
      <HighchartsReact highcharts={Highcharts} options={options} />
      {!compact && hasGap && (
        <div className="competency-gap">
          <span className="competency-gap__label">역량 Gap 상위</span>
          {gapSummary.map(({ sj, gap }) => (
            <span key={sj} className="competency-gap__item">
              {sj} <strong>-{gap}pt</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
