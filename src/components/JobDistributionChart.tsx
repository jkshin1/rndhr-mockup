import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import type { TFTemplate } from "../data/mockData";

// 세부 직무 순서 (소자 그룹 → 공정 그룹)
const ORDER = [
  "PI", "Device", "FA",
  "Photo공정", "Etch공정", "Diffusion공정", "ThinFilm공정", "C&C공정",
];

// 소자 = 파란 계열 / 공정 = 주황·황색 계열
const COLOR_MAP: Record<string, string> = {
  PI:             "#1d4ed8",
  Device:         "#2563eb",
  FA:             "#60a5fa",
  "Photo공정":    "#b45309",
  "Etch공정":     "#d97706",
  "Diffusion공정":"#f59e0b",
  "ThinFilm공정": "#fbbf24",
  "C&C공정":      "#fed7aa",
};

const SOJA_BAND  = "rgba(37,99,235,0.05)";
const GONGJ_BAND = "rgba(180,83,9,0.05)";

interface Props {
  template: TFTemplate;
  compact?: boolean;
}

export default function JobDistributionChart({ template, compact }: Props) {
  const { jobDistribution, totalHeadcount } = template;

  // ORDER 순서로 정렬된 데이터 준비
  const sorted = ORDER.map((sj) => {
    const found = jobDistribution.find((d) => d.subJob === sj);
    return { subJob: sj, count: found?.count ?? 0, middleJob: found?.middleJob ?? "소자" };
  });

  const categories = sorted.map((d) => d.subJob);
  const data = sorted.map((d) => ({ y: d.count, color: COLOR_MAP[d.subJob] ?? "#94a3b8" }));

  const sojaTotal = sorted.filter(d => d.middleJob === "소자").reduce((s, d) => s + d.count, 0);
  const gongTotal = sorted.filter(d => d.middleJob === "공정").reduce((s, d) => s + d.count, 0);

  const height = compact ? 280 : 340;

  const options: Highcharts.Options = {
    chart: {
      type: "bar",
      height,
      margin: compact ? [8, 70, 20, 110] : [20, 80, 20, 110],
      animation: false,
    },
    title: { text: undefined },
    xAxis: {
      categories,
      title: { text: null },
      labels: {
        style: { fontSize: compact ? "11px" : "12px", fontWeight: "600" },
      },
      // 소자/공정 그룹 배경 밴드
      plotBands: [
        {
          from: -0.5, to: 2.5,
          color: SOJA_BAND,
          label: {
            text: "소자",
            align: "left",
            x: -110,
            style: { fontSize: "11px", fontWeight: "700", color: "#1d4ed8" },
          },
        },
        {
          from: 2.5, to: 7.5,
          color: GONGJ_BAND,
          label: {
            text: "공정",
            align: "left",
            x: -110,
            style: { fontSize: "11px", fontWeight: "700", color: "#b45309" },
          },
        },
      ],
      // 소자/공정 경계선
      plotLines: [
        {
          value: 2.5,
          color: "#cbd5e1",
          width: 1,
          dashStyle: "Dot",
        },
      ],
    },
    yAxis: {
      min: 0,
      title: { text: null },
      labels: { style: { fontSize: "10px" } },
    },
    legend: { enabled: false },
    tooltip: {
      formatter(this: Highcharts.TooltipFormatterContextObject) {
        const cat = categories[this.point.x as number];
        const mj = sorted[this.point.x as number]?.middleJob;
        return `<b>${mj} › ${cat}</b><br/>${this.y}명`;
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 3,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: "{y}명",
          style: { fontSize: "10px", fontWeight: "600", color: "#374151" },
        },
      },
    },
    credits: { enabled: false },
    series: [
      {
        type: "bar",
        name: "인원",
        data,
      },
    ],
  };

  return (
    <div className="job-dist">
      {!compact && (
        <div className="job-dist__summary">
          <div className="job-dist__badge job-dist__badge--soja">
            <span>소자</span>
            <strong>{sojaTotal}명</strong>
            <small>PI · Device · FA</small>
          </div>
          <div className="job-dist__badge job-dist__badge--gongjeong">
            <span>공정</span>
            <strong>{gongTotal}명</strong>
            <small>Photo · Etch · Diffusion · ThinFilm · C&C</small>
          </div>
          <div className="job-dist__badge job-dist__badge--total">
            <span>합계</span>
            <strong>{totalHeadcount.toLocaleString()}명</strong>
            <small>전체 배치 인원</small>
          </div>
        </div>
      )}
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}
