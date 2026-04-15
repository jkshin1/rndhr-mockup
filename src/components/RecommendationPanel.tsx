import type { TFTemplate } from "../data/mockData";
import JobDistributionChart from "./JobDistributionChart";
import TFCompetencyChart from "./TFCompetencyChart";
import RiskAnalysisSection from "./RiskAnalysisSection";
import FunctionOrgImpactSection from "./FunctionOrgImpactSection";

interface Props {
  template: TFTemplate;
}

export default function RecommendationPanel({ template }: Props) {
  return (
    <div className="rec-panel">
      <div className="rec-panel__header">
        <h2>{template.name} — 배치 시뮬레이션 결과</h2>
        <p>직무 구성 현황 · 역량 Gap · 인력 배치 Risk 분석</p>
      </div>

      {/* 직무 구성 현황 + 역량 비교 */}
      <div className="rec-charts-row">
        <section className="rec-section rec-section--half">
          <h3 className="rec-section__title">직무 구성 현황</h3>
          <JobDistributionChart template={template} compact />
        </section>

        <section className="rec-section rec-section--half">
          <h3 className="rec-section__title">필요 역량 vs 배치 후 역량</h3>
          <TFCompetencyChart template={template} compact />
        </section>
      </div>

      {/* 인력 배치 Risk 점검 */}
      <section className="rec-section">
        <h3 className="rec-section__title">인력 배치 Risk 점검</h3>
        <p className="rec-section__sub">직무별 인원 부족 현황 및 역량 Gap 분석 · 권고 조치</p>
        <RiskAnalysisSection template={template} />
      </section>

      {/* Function 조직 영향 분석 */}
      <section className="rec-section">
        <h3 className="rec-section__title">Function 조직 영향 분석</h3>
        <p className="rec-section__sub">
          TF 구성을 위한 Function 조직(TD · 공정) 인력 차출 영향 · 잔여 인력 및 역량 리스크 점검
        </p>
        <FunctionOrgImpactSection template={template} />
      </section>
    </div>
  );
}
