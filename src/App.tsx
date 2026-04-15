import { useState } from "react";
import TFRequestPanel from "./components/TFRequestPanel";
import RecommendationPanel from "./components/RecommendationPanel";
import {
  tfTemplates,
  generateRecommendations,
  type TFTemplate,
  type RoleRecommendation,
} from "./data/mockData";
import "./App.css";

export default function App() {
  const [selectedTemplate, setSelectedTemplate] = useState<TFTemplate | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<TFTemplate | null>(null);
  const [recommendations, setRecommendations] = useState<RoleRecommendation[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (template: TFTemplate) => {
    setSelectedTemplate(template);
    // Reset results when selecting a different TF
    if (activeTemplate?.id !== template.id) {
      setRecommendations(null);
      setActiveTemplate(null);
    }
  };

  const handleRecommend = (template: TFTemplate) => {
    setLoading(true);
    setRecommendations(null);
    setActiveTemplate(template);
    setTimeout(() => {
      const result = generateRecommendations(template);
      setRecommendations(result);
      setLoading(false);
    }, 1200);
  };

  const totalPool = tfTemplates.reduce((s, t) => s + t.totalHeadcount, 0);

  return (
    <div className="app">
      <header className="header">
        <div className="header__logo">
          <span className="header__symbol">SK</span>
          <div className="header__titles">
            <h1>R&D 인력 배치 시스템</h1>
            <span className="header__sub">Tech TF 구성 추천</span>
          </div>
        </div>
        <div className="header__info">
          <span>전체 TF: {tfTemplates.length}개</span>
          <span className="header__dot" />
          <span>총 배치 인력: {totalPool.toLocaleString()}명</span>
        </div>
      </header>

      <main className="main">
        <aside className="left-panel">
          <TFRequestPanel
            templates={tfTemplates}
            onSelect={handleSelect}
            onRecommend={handleRecommend}
          />
        </aside>

        <section className="right-panel">
          {loading && (
            <div className="loading">
              <div className="loading__spinner" />
              <p>역량 데이터를 분석하여 최적의 인력을 추천하고 있습니다...</p>
            </div>
          )}

          {!loading && !recommendations && !selectedTemplate && (
            <div className="empty-state">
              <div className="empty-state__icon">👥</div>
              <h3>TF 유형을 선택하고 추천을 요청하세요</h3>
              <p>
                구성원들의 역량, 경력, 프로젝트 이력을 분석하여
                <br />
                최적의 TF 인력 구성을 추천합니다.
              </p>
            </div>
          )}

          {!loading && !recommendations && selectedTemplate && (
            <div className="empty-state">
              <div className="empty-state__icon">🔍</div>
              <h3>{selectedTemplate.name} TF가 선택되었습니다</h3>
              <p>
                좌측 하단의 <strong>인력 배치 시뮬레이션</strong> 버튼을 눌러
                <br />
                직무 구성 현황 및 역량 Gap 분석 결과를 확인하세요.
              </p>
            </div>
          )}

          {!loading && recommendations && activeTemplate && (
            <RecommendationPanel template={activeTemplate} />
          )}
        </section>
      </main>
    </div>
  );
}
