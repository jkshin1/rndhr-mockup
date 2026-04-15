import type { TFTemplate } from "../data/mockData";

const SUB_JOBS_ORDER = [
  "PI", "Device", "FA",
  "Photo공정", "Etch공정", "Diffusion공정", "ThinFilm공정", "C&C공정",
] as const;

type RiskLevel = "high" | "medium" | "low";
type Action   = "신규 채용" | "코칭·육성" | "현 수준 유지";

interface RiskItem {
  subJob: string;
  middleJob: string;
  currentCount: number;
  targetCount: number;
  countGap: number;
  actualScore: number;
  targetScore: number;
  compGap: number;
  riskLevel: RiskLevel;
  actions: Action[];
}

const RISK_META: Record<RiskLevel, { bg: string; border: string; text: string; label: string; dot: string }> = {
  high:   { bg: "#fff1f2", border: "#fecdd3", text: "#be123c", label: "고위험", dot: "#ef4444" },
  medium: { bg: "#fffbeb", border: "#fde68a", text: "#b45309", label: "중위험", dot: "#f59e0b" },
  low:    { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", label: "저위험", dot: "#22c55e" },
};

function computeRisk(countGap: number, compGap: number): { riskLevel: RiskLevel; actions: Action[] } {
  const riskLevel: RiskLevel =
    compGap >= 15 || (compGap >= 8 && countGap >= 10)
      ? "high"
      : compGap >= 6 || countGap >= 7
      ? "medium"
      : "low";

  const actions: Action[] = [];
  if (countGap >= 7) actions.push("신규 채용");
  if (compGap >= 6)  actions.push("코칭·육성");
  if (actions.length === 0) actions.push("현 수준 유지");

  return { riskLevel, actions };
}

export default function RiskAnalysisSection({ template }: { template: TFTemplate }) {
  const items: RiskItem[] = SUB_JOBS_ORDER.map((sj) => {
    const dist        = template.jobDistribution.find((d) => d.subJob === sj);
    const actualScore = template.competencyScores.find((c) => c.subJob === sj)?.score ?? 0;
    const targetScore = template.targetCompetencyScores.find((c) => c.subJob === sj)?.score ?? 0;
    const currentCount = dist?.count ?? 0;
    const targetCount  = dist?.targetCount ?? 0;
    const countGap = Math.max(0, targetCount - currentCount);
    const compGap  = Math.max(0, targetScore - actualScore);
    const { riskLevel, actions } = computeRisk(countGap, compGap);

    return {
      subJob: sj,
      middleJob: dist?.middleJob ?? "소자",
      currentCount,
      targetCount,
      countGap,
      actualScore,
      targetScore,
      compGap,
      riskLevel,
      actions,
    };
  });

  // 집계
  const highItems   = items.filter((i) => i.riskLevel === "high");
  const mediumItems = items.filter((i) => i.riskLevel === "medium");
  const lowItems    = items.filter((i) => i.riskLevel === "low");

  const hiringItems  = items.filter((i) => i.actions.includes("신규 채용"));
  const coachItems   = items.filter((i) => i.actions.includes("코칭·육성"));
  const totalHiring  = hiringItems.reduce((s, i) => s + i.countGap, 0);

  return (
    <div className="risk-wrap">

      {/* ── 위험도 요약 카드 ── */}
      <div className="risk-summary">
        {(["high", "medium", "low"] as RiskLevel[]).map((lvl) => {
          const m = RISK_META[lvl];
          const cnt = lvl === "high" ? highItems.length : lvl === "medium" ? mediumItems.length : lowItems.length;
          return (
            <div key={lvl} className="risk-summary__card" style={{ borderTop: `4px solid ${m.dot}` }}>
              <span className="risk-summary__count" style={{ color: m.text }}>{cnt}</span>
              <span className="risk-summary__label">{m.label} 직무</span>
            </div>
          );
        })}
        <div className="risk-summary__card" style={{ borderTop: "4px solid #6366f1" }}>
          <span className="risk-summary__count" style={{ color: "#4338ca" }}>{totalHiring}명</span>
          <span className="risk-summary__label">신규 채용 필요</span>
        </div>
        <div className="risk-summary__card" style={{ borderTop: "4px solid #0ea5e9" }}>
          <span className="risk-summary__count" style={{ color: "#0369a1" }}>{coachItems.length}개</span>
          <span className="risk-summary__label">코칭 대상 직무</span>
        </div>
      </div>

      {/* ── 직무별 리스크 테이블 ── */}
      <div className="risk-table">
        {/* 헤더 */}
        <div className="risk-table__head">
          <span>직무</span>
          <span>위험도</span>
          <span className="risk-table__center">현재 인원</span>
          <span className="risk-table__center">필요 인원</span>
          <span className="risk-table__center">인원 Gap</span>
          <span className="risk-table__center">역량 Gap</span>
          <span>권고 조치</span>
        </div>

        {items.map((item) => {
          const m = RISK_META[item.riskLevel];
          return (
            <div
              key={item.subJob}
              className="risk-table__row"
              style={{ background: m.bg, borderLeft: `4px solid ${m.dot}` }}
            >
              {/* 직무명 */}
              <span className="risk-table__subjob">
                <span className={`risk-mj risk-mj--${item.middleJob === "소자" ? "soja" : "gong"}`}>
                  {item.middleJob}
                </span>
                <strong>{item.subJob}</strong>
              </span>

              {/* 위험도 */}
              <span className="risk-table__level">
                <span className="risk-dot" style={{ background: m.dot }} />
                <span style={{ color: m.text, fontWeight: 700 }}>{m.label}</span>
              </span>

              {/* 현재/필요 인원 */}
              <span className="risk-table__num risk-table__center">{item.currentCount}명</span>
              <span className="risk-table__num risk-table__center">{item.targetCount}명</span>

              {/* Gap 수치 */}
              <span className={`risk-table__center risk-gap ${item.countGap > 0 ? "risk-gap--neg" : "risk-gap--ok"}`}>
                {item.countGap > 0 ? `▼ ${item.countGap}명` : "✓"}
              </span>
              <span className={`risk-table__center risk-gap ${item.compGap > 0 ? "risk-gap--neg" : "risk-gap--ok"}`}>
                {item.compGap > 0 ? `▼ ${item.compGap}pt` : "✓"}
              </span>

              {/* 권고 조치 */}
              <span className="risk-table__actions">
                {item.actions.map((act) => (
                  <span
                    key={act}
                    className={`action-pill ${
                      act === "신규 채용"   ? "action-pill--hire"
                    : act === "코칭·육성" ? "action-pill--coach"
                    : "action-pill--ok"
                    }`}
                  >
                    {act === "신규 채용"   && "👤 "}
                    {act === "코칭·육성" && "📚 "}
                    {act === "현 수준 유지" && "✅ "}
                    {act}
                  </span>
                ))}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── 종합 권고 조치 ── */}
      <div className="risk-actions">
        {hiringItems.length > 0 && (
          <div className="risk-action-card risk-action-card--hire">
            <div className="risk-action-card__icon">👤</div>
            <div className="risk-action-card__body">
              <div className="risk-action-card__title">신규 채용 필요</div>
              <div className="risk-action-card__desc">
                <strong>{hiringItems.length}개 직무</strong>에서 총{" "}
                <strong>{totalHiring}명</strong> 충원 필요
              </div>
              <div className="risk-action-card__jobs">
                {hiringItems.map((i) => (
                  <span key={i.subJob} className="risk-action-card__tag">
                    {i.subJob} ({i.countGap}명)
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {coachItems.length > 0 && (
          <div className="risk-action-card risk-action-card--coach">
            <div className="risk-action-card__icon">📚</div>
            <div className="risk-action-card__body">
              <div className="risk-action-card__title">코칭 및 육성 프로그램 필요</div>
              <div className="risk-action-card__desc">
                <strong>{coachItems.length}개 직무</strong> 대상 역량 강화 교육 및 코칭 프로그램 운영 필요
              </div>
              <div className="risk-action-card__jobs">
                {coachItems.map((i) => (
                  <span key={i.subJob} className="risk-action-card__tag risk-action-card__tag--coach">
                    {i.subJob} (−{i.compGap}pt)
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
