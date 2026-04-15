import type { TFTemplate } from "../data/mockData";
import {
  computeFunctionOrgImpact,
  type FunctionOrgImpact,
  type FunctionRiskLevel,
} from "../data/mockData";

const SUB_ORDER = [
  "PI", "Device", "FA",
  "Photo공정", "Etch공정", "Diffusion공정", "ThinFilm공정", "C&C공정",
] as const;

const RISK_META: Record<FunctionRiskLevel, { text: string; dot: string; label: string }> = {
  high:   { text: "#be123c", dot: "#ef4444", label: "고위험" },
  medium: { text: "#b45309", dot: "#f59e0b", label: "중위험" },
  low:    { text: "#15803d", dot: "#22c55e", label: "정상" },
};

interface Props {
  template: TFTemplate;
}

export default function FunctionOrgImpactSection({ template }: Props) {
  const raw = computeFunctionOrgImpact(template.id);
  const items: FunctionOrgImpact[] = SUB_ORDER
    .map((sj) => raw.find((r) => r.subJob === sj))
    .filter((x): x is FunctionOrgImpact => Boolean(x));

  // 집계
  const tdItems   = items.filter((i) => i.functionMiddle === "TD");
  const gongItems = items.filter((i) => i.functionMiddle === "공정");

  const totalPulled = items.reduce((s, i) => s + i.pulledCount, 0);
  const tdPulled    = tdItems.reduce((s, i) => s + i.pulledCount, 0);
  const gongPulled  = gongItems.reduce((s, i) => s + i.pulledCount, 0);

  const highItems   = items.filter((i) => i.riskLevel === "high");
  const mediumItems = items.filter((i) => i.riskLevel === "medium");

  const maxOriginal = Math.max(...items.map((i) => i.originalCount));

  return (
    <div className="func-impact">

      {/* ── 차출 요약 카드 ── */}
      <div className="func-summary">
        <SummaryCard label="총 차출 인력" value={`${totalPulled}명`} color="#6366f1" />
        <SummaryCard label="TD 조직 차출" value={`${tdPulled}명`} color="#2563eb" />
        <SummaryCard label="공정 조직 차출" value={`${gongPulled}명`} color="#d97706" />
        <SummaryCard label="고위험 직무" value={`${highItems.length}개`} color="#ef4444" />
        <SummaryCard label="중위험 직무" value={`${mediumItems.length}개`} color="#f59e0b" />
      </div>

      {/* ── 직무별 차출 영향 바 차트 ── */}
      <div className="func-bars">
        <div className="func-bars__legend">
          <span><i className="func-legend-box func-legend-box--remain" />잔여 인력</span>
          <span><i className="func-legend-box func-legend-box--pulled" />TF 차출</span>
          <span><i className="func-legend-min" />최소 필요 인력</span>
        </div>

        {items.map((item) => {
          const m = RISK_META[item.riskLevel];
          const pct = (n: number) => (n / maxOriginal) * 100;
          const remPct  = pct(item.remainingCount);
          const pullPct = pct(item.pulledCount);
          const minPct  = pct(item.minimumRequired);

          return (
            <div key={item.subJob} className="func-bar-row">
              {/* 직무 라벨 */}
              <div className="func-bar-row__label">
                <span className={`func-mid-badge func-mid-badge--${item.functionMiddle === "TD" ? "td" : "gong"}`}>
                  {item.functionMiddle}
                </span>
                <strong>{item.subJob}</strong>
                <span className="func-risk-chip" style={{ color: m.text }}>
                  <i style={{ background: m.dot }} />{m.label}
                </span>
              </div>

              {/* 차출 바 */}
              <div className="func-bar-row__bar">
                <div className="func-bar-row__track">
                  <div
                    className={`func-bar-row__remain func-bar-row__remain--${item.riskLevel}`}
                    style={{ width: `${remPct}%` }}
                  >
                    {remPct > 10 && <span>{item.remainingCount}</span>}
                  </div>
                  <div
                    className="func-bar-row__pulled"
                    style={{ width: `${pullPct}%` }}
                  >
                    {pullPct > 6 && <span>−{item.pulledCount}</span>}
                  </div>
                </div>
                <div
                  className="func-bar-row__min-line"
                  style={{ left: `${minPct}%` }}
                  title={`최소 필요 ${item.minimumRequired}명`}
                >
                  <span className="func-bar-row__min-label">min {item.minimumRequired}</span>
                </div>
              </div>

              {/* 수치 */}
              <div className="func-bar-row__stats">
                <div className="func-bar-row__flow">
                  <span>{item.originalCount}명</span>
                  <span className="func-bar-row__arrow">→</span>
                  <strong>{item.remainingCount}명</strong>
                  <span className="func-bar-row__delta">(−{item.pulledCount})</span>
                </div>
                <div className={`func-bar-row__gap func-bar-row__gap--${item.riskLevel}`}>
                  {item.shortage > 0
                    ? `▼ 최소 기준 ${item.shortage}명 부족`
                    : `✓ ${item.margin}명 여유`}
                </div>
                <div className="func-bar-row__comp">
                  역량 {item.competencyBefore}
                  <span className="func-bar-row__arrow">→</span>
                  {item.competencyAfter}
                  {item.competencyDrop > 0 && (
                    <em className="func-bar-row__comp-drop"> (−{item.competencyDrop}pt)</em>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 종합 권고 ── */}
      {(highItems.length > 0 || mediumItems.length > 0) && (
        <div className="func-actions">
          {highItems.length > 0 && (
            <div className="func-action-card func-action-card--high">
              <div className="func-action-card__icon">⚠️</div>
              <div className="func-action-card__body">
                <div className="func-action-card__title">Function 조직 고위험 발생</div>
                <div className="func-action-card__desc">
                  <strong>{highItems.length}개 직무</strong>에서 최소 운영 인원 미달 또는 핵심 인력 손실 발생
                </div>
                <div className="func-action-card__list">
                  {highItems.map((i) => (
                    <div key={i.subJob} className="func-action-card__item">
                      <span className="func-action-card__tag">
                        {i.functionMiddle} · <strong>{i.subJob}</strong>
                      </span>
                      <span className="func-action-card__msg">
                        {i.shortage > 0
                          ? `잔여 ${i.remainingCount}명 (최소 ${i.minimumRequired}명) · ${i.shortage}명 충원 또는 차출 축소 검토 필요`
                          : `핵심 인력 차출로 역량 ${i.competencyDrop}pt 하락 예상 · 유지 협상 또는 대체 인력 확보 필요`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mediumItems.length > 0 && (
            <div className="func-action-card func-action-card--medium">
              <div className="func-action-card__icon">📌</div>
              <div className="func-action-card__body">
                <div className="func-action-card__title">Function 조직 모니터링 필요</div>
                <div className="func-action-card__desc">
                  <strong>{mediumItems.length}개 직무</strong>가 최소 운영 기준에 근접 · 추가 차출 시 리스크 전환 가능
                </div>
                <div className="func-action-card__list func-action-card__list--compact">
                  {mediumItems.map((i) => (
                    <span key={i.subJob} className="func-action-card__tag func-action-card__tag--medium">
                      {i.subJob} (여유 {i.margin}명 · 역량 −{i.competencyDrop}pt)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="func-summary__card" style={{ borderTop: `4px solid ${color}` }}>
      <span className="func-summary__value" style={{ color }}>{value}</span>
      <span className="func-summary__label">{label}</span>
    </div>
  );
}
