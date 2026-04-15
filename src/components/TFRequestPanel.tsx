import { useState } from "react";
import type { TFTemplate } from "../data/mockData";

interface Props {
  templates: TFTemplate[];
  onSelect: (template: TFTemplate) => void;
  onRecommend: (template: TFTemplate) => void;
}

const MIDDLE_JOB_ORDER = ["소자", "공정"] as const;
const SOJA_JOBS  = ["PI", "Device", "FA"];
const COLOR_MIDDLE: Record<string, string> = {
  "소자": "comp-group--soja",
  "공정": "comp-group--gongjeong",
};

export default function TFRequestPanel({ templates, onSelect, onRecommend }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = templates.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="tf-panel">
      <h2 className="tf-panel__title">Tech TF 구성 요청</h2>
      <p className="tf-panel__subtitle">구성할 TF 유형을 선택하세요</p>

      <div className="tf-cards">
        {templates.map((t) => (
          <button
            key={t.id}
            className={`tf-card ${selectedId === t.id ? "tf-card--active" : ""}`}
            onClick={() => { setSelectedId(t.id); onSelect(t); }}
          >
            <span className="tf-card__name">{t.name}</span>
            <span className="tf-card__size">~{t.totalHeadcount.toLocaleString()}명</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="tf-detail">
          <h3 className="tf-detail__name">{selected.name}</h3>

          {/* 직무별 필요 역량 */}
          <h4 className="tf-detail__roles-title">직무별 필요 역량</h4>

          {MIDDLE_JOB_ORDER.map((mj) => {
            const items = selected.jobCompetencies.filter((jc) =>
              mj === "소자" ? SOJA_JOBS.includes(jc.subJob) : !SOJA_JOBS.includes(jc.subJob)
            );
            return (
              <div key={mj} className={`comp-group ${COLOR_MIDDLE[mj]}`}>
                <div className="comp-group__header">
                  <span className="comp-group__label">{mj}</span>
                </div>
                <ul className="comp-list">
                  {items.map((jc) => (
                    <li key={jc.subJob} className="comp-item">
                      <div className="comp-item__top">
                        <span className="comp-item__subjob">{jc.subJob}</span>
                        <span className="comp-item__career">경력 {jc.minCareerYears}년↑</span>
                      </div>
                      <p className="comp-item__resp">{jc.responsibility}</p>
                      <div className="comp-item__skills">
                        {jc.requiredSkills.map((s) => (
                          <span key={s} className="skill-tag">{s}</span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <button
            className="btn-recommend"
            onClick={() => onRecommend(selected)}
          >
            인력 배치 시뮬레이션
          </button>
        </div>
      )}
    </div>
  );
}
