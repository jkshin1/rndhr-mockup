// ── 조직 신설 인력 배치 시뮬레이션 데이터 ───────────────────────
import type { OrgSetupResult, OrgSubJob } from './orgSetupData';

// ── Type definitions ──────────────────────────────────────────

export interface OrgCandidate {
  id: string;
  name: string;
  currentTeam: string;
  currentDamDang: string;
  cl: 'CL3' | 'CL4' | 'CL5';
  careerYears: number;
  matchScore: number;
  currentCompetencyScore: number;
  techPillar: string;
  strengths: string[];
  gapAreas: string[];
  rndAlignment: number;
}

export interface OrgPlacementResult {
  detailJobId: string;
  detailJobName: string;
  subItems?: string[];
  description: string;
  requestedHeadcount: number;
  targetScore: number;
  candidates: OrgCandidate[];
  avgPlacedScore: number;
  scoreGap: number;
  fulfillmentRate: number;
}

export interface SourceTeamImpact {
  teamName: string;
  damDangName: string;
  currentHeadcount: number;
  pulledCount: number;
  remainingCount: number;
  minimumRequired: number;
  riskLevel: 'high' | 'medium' | 'low';
  affectedRoles: string[];
}

export interface DamDangRisk {
  damDangName: string;
  teams: { teamName: string; pulled: number; remaining: number; riskLevel: 'high' | 'medium' | 'low' }[];
  totalCurrentHeadcount: number;
  totalPulled: number;
  totalRemaining: number;
  minimumRequired: number;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface CompetencyGapItem {
  competencyName: string;
  requiredLevel: number;
  currentAvg: number;
  gap: number;
  priority: 'critical' | 'important' | 'normal';
  developmentPlan: string;
  timeframe: string;
}

export interface CareerDevelopment {
  candidateId: string;
  candidateName: string;
  cl: 'CL3' | 'CL4' | 'CL5';
  currentRole: string;
  strengths: { area: string; level: number }[];
  rndDirection: string;
  careerPath: string;
  developmentAreas: { area: string; currentLevel: number; targetLevel: number; suggestion: string }[];
}

export interface OrgSimSummary {
  overallScore: number;
  totalRequested: number;
  totalPlaced: number;
  fulfillmentRate: number;
  avgMatchScore: number;
  competencyFillRate: number;
  newHiringNeeded: number;
  developmentNeeded: number;
  riskTeamCount: number;
}

export interface OrgSetupSimResult {
  summary: OrgSimSummary;
  placements: OrgPlacementResult[];
  sourceTeamImpacts: SourceTeamImpact[];
  damDangRisks: DamDangRisk[];
  competencyGaps: CompetencyGapItem[];
  careerDevelopments: CareerDevelopment[];
  hiringRecommendations: { detailJobName: string; count: number; reason: string }[];
  developmentRecommendations: { candidateName: string; area: string; plan: string; timeframe: string }[];
}

// ── Seeded random helper ──────────────────────────────────────

function seedHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

class SeededRandom {
  private state: number;
  constructor(seed: number) {
    this.state = seed;
  }
  next(): number {
    this.state = (this.state * 1664525 + 1013904223) & 0x7fffffff;
    return this.state / 0x7fffffff;
  }
  intRange(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  pickN<T>(arr: T[], n: number): T[] {
    const copy = [...arr];
    const result: T[] = [];
    for (let i = 0; i < Math.min(n, copy.length); i++) {
      const idx = Math.floor(this.next() * copy.length);
      result.push(copy.splice(idx, 1)[0]);
    }
    return result;
  }
}

// ── Mock data pools ───────────────────────────────────────────

const NAMES = [
  '김태현', '이수진', '박준호', '정민서', '최영준', '한지영', '서동욱', '윤하나',
  '강현우', '조은비', '임재혁', '오세영', '신민재', '유다은', '장성호', '문지훈',
  '배수현', '권나영', '홍승민', '노정은', '안기훈', '전소라', '류태우', '허은정',
  '남궁혁', '황예진', '송재원', '차미선', '고동현', '양수빈', '피재영', '탁세윤',
  '우현석', '방은서', '제민수', '변지아', '감태준', '석하윤', '도경민', '마은채',
];

interface SubJobTeamPool {
  teams: string[];
  damDangs: string[];
  techPillars: string[];
  competencyAreas: string[];
  roles: string[];
}

const SUBJOB_POOLS: Record<OrgSubJob, SubJobTeamPool> = {
  PI: {
    teams: ['PI 1팀', 'PI 2팀', 'PI통합팀', '공정통합팀', 'PI선행팀', 'PI 3팀'],
    damDangs: ['소자개발담당', 'PI담당', '선행개발담당'],
    techPillars: ['Cell 미세화', '3D 구조 설계', '공정 통합', 'PERI 최적화', '수율 향상', 'Cell 아키텍처'],
    competencyAreas: ['공정 플로우 설계', 'Cell 구조 이해', '수율 분석', 'PERI 통합', 'MLM 최적화', 'Bonding 공정', '3D 적층 기술', 'SN 형성 기술'],
    roles: ['PI 엔지니어', '공정통합 엔지니어', 'Cell 개발자', 'PERI 개발자', '수율 엔지니어'],
  },
  CA: {
    teams: ['CA 1팀', 'CA설계팀', 'Cell설계팀', 'CA해석팀', 'CA 2팀', 'SPICE팀'],
    damDangs: ['소자개발담당', 'Cell설계담당', '선행소자담당'],
    techPillars: ['Cell 미세화', '트랜지스터 설계', '캐패시터 최적화', 'Bitline 설계', '누설 전류 제어', 'SPICE 모델링'],
    competencyAreas: ['트랜지스터 특성', '캐패시터 설계', '비트라인 최적화', 'GIDL 제어', '리프레시 분석', '누설 전류 분석', 'SPICE 시뮬레이션', 'CD 최적화'],
    roles: ['소자 설계 엔지니어', 'Cell 설계자', 'SPICE 모델러', '특성 분석 엔지니어', 'CD 엔지니어'],
  },
  FA: {
    teams: ['FA분석팀', '불량분석팀', '신뢰성평가팀', 'FA 1팀', 'FA 2팀', '수율분석팀'],
    damDangs: ['품질/신뢰성담당', 'FA담당', '분석평가담당'],
    techPillars: ['불량 분석 기술', 'TEM/SEM 분석', '신뢰성 평가', '수율 분석', '표면 분석', '화학 분석'],
    competencyAreas: ['EL 분석', 'TEM 분석', 'SEM 분석', 'SIMS 분석', 'XRF 분석', 'HTOL 평가', 'TDDB 분석', '수율 데이터 분석'],
    roles: ['FA 엔지니어', '분석 전문가', '신뢰성 평가 엔지니어', '수율 분석가', '계측 엔지니어'],
  },
  Photo공정: {
    teams: ['Photo 1팀', 'Photo공정팀', 'EUV팀', 'OPC팀', 'Photo 2팀', '계측팀'],
    damDangs: ['공정개발담당', '전공정담당', 'Photo담당'],
    techPillars: ['EUV 패터닝', 'ArF 리소그래피', 'OPC 기술', 'CD 계측', '멀티패터닝', '레지스트 기술'],
    competencyAreas: ['EUV 공정', 'ArF 공정', 'OPC/RET', 'CD 계측', '레지스트 개발', '멀티패터닝', '패턴 검사', '오버레이 제어'],
    roles: ['Photo 엔지니어', 'EUV 공정 개발자', 'OPC 엔지니어', '계측 엔지니어', '레지스트 개발자'],
  },
  Etch공정: {
    teams: ['Etch 1팀', 'Etch 2팀', 'Etch공정팀', 'HAR식각팀', '플라즈마팀', 'ALE팀'],
    damDangs: ['공정개발담당', '식각공정담당', '전공정담당'],
    techPillars: ['HAR 식각', '플라즈마 제어', 'ALE 기술', '금속 식각', '선택비 제어', '프로파일 제어'],
    competencyAreas: ['HAR 식각', '폴리실리콘 식각', '금속 식각', '플라즈마 개발', 'ALE 공정', '선택비 제어', '프로파일 제어', '종점 검출'],
    roles: ['Etch 엔지니어', '플라즈마 개발자', 'HAR 공정 개발자', 'ALE 연구원', '프로파일 엔지니어'],
  },
  Diffusion공정: {
    teams: ['Diff 1팀', 'Diff 2팀', 'ALD팀', 'CVD팀', '열처리팀', '확산공정팀'],
    damDangs: ['공정개발담당', '확산공정담당', '전공정담당'],
    techPillars: ['ALD 박막', 'CVD 증착', '열처리 기술', '도핑 제어', '계면 최적화', '절연막 기술'],
    competencyAreas: ['ALD 공정', 'CVD 공정', '열처리 최적화', '도핑 프로파일', '계면 특성', '배리어 공정', 'Low-K 증착', '실리사이드 형성'],
    roles: ['Diff 엔지니어', 'ALD 공정 개발자', 'CVD 엔지니어', '열처리 엔지니어', '도핑 전문가'],
  },
  ThinFilm공정: {
    teams: ['TF 1팀', 'TF 2팀', 'CMP팀', 'PVD팀', '배선공정팀', '금속박막팀'],
    damDangs: ['공정개발담당', '박막공정담당', '후공정담당'],
    techPillars: ['PVD 박막', 'CMP 평탄화', 'W 플러그', 'Cu 배선', '배리어 막', '다마신 공정'],
    competencyAreas: ['PVD 공정', 'CMP 공정', 'W 플러그', '배리어 공정', 'Cu 전기도금', '콘택 형성', '비아 공정', '다마신 공정'],
    roles: ['TF 엔지니어', 'CMP 개발자', 'PVD 공정 개발자', '배선 엔지니어', '금속 박막 연구원'],
  },
  'C&C공정': {
    teams: ['C&C 1팀', 'C&C 2팀', '세정공정팀', '표면처리팀', '습식팀', 'Chemical팀'],
    damDangs: ['공정개발담당', '세정공정담당', '전공정담당'],
    techPillars: ['FEOL 세정', 'BEOL 세정', '파티클 제어', '표면 처리', '습식 세정', '매엽식 세정'],
    competencyAreas: ['FEOL 세정', 'BEOL 세정', 'SC1/SC2 공정', 'HF 세정', '파티클 제어', '표면 개질', '배치 세정', '스프레이 세정'],
    roles: ['C&C 엔지니어', '세정 공정 개발자', '표면 처리 전문가', '파티클 분석 엔지니어', 'Chemical 엔지니어'],
  },
};

const DEVELOPMENT_PLANS = [
  '전문 교육 프로그램 수강 및 OJT',
  '사내 멘토링 프로그램 매칭',
  '외부 세미나 및 학회 참가',
  '사내 전문가 코칭 프로그램 참여',
  '프로젝트 기반 실습 (Learning by Doing)',
  '타 부서 교차 근무를 통한 역량 확대',
  '사내 기술 워크숍 참여 및 발표',
  '선진사 벤치마킹 출장 및 기술 교류',
  '온라인 전문 교육 과정 이수',
  '사내 R&D 기술 세미나 시리즈 참여',
];

const RND_DIRECTIONS = [
  '차세대 DRAM 미세화 기술 선도',
  '3D DRAM 구조 전환 핵심 역량 확보',
  'EUV 기반 공정 기술 내재화',
  '고대역폭 메모리(HBM) 기술 역량 강화',
  '선단 공정 수율 극대화 및 품질 향상',
  'AI/ML 기반 공정 최적화 연구',
  '차세대 소재 및 공정 통합 기술 개발',
  '초미세 패터닝 기술 혁신',
];

const CAREER_PATHS = [
  '공정 통합 전문가 → 선행 개발 리더',
  '단위 공정 전문가 → 공정 아키텍트',
  '분석 전문가 → 기술 자문(Fellow)',
  'R&D 엔지니어 → 프로젝트 매니저 → 기술 리더',
  '공정 개발자 → 양산 기술 리더 → 기술 총괄',
  '설계 엔지니어 → 소자 아키텍트 → R&D 센터장',
  '분석 엔지니어 → 품질 전문가 → 품질 총괄',
  '연구원 → 선행 연구 리더 → 기술 경영 전문가',
];

// ── Main simulation function ──────────────────────────────────

export function generateOrgSimulation(setupResult: OrgSetupResult): OrgSetupSimResult {
  const { subJob, requirements } = setupResult;
  const pool = SUBJOB_POOLS[subJob];
  const baseSeed = seedHash(subJob + requirements.map(r => r.detailJobId).join('|'));
  const rng = new SeededRandom(baseSeed);

  // Track globally used names so no duplicates
  const usedNames = new Set<string>();
  let globalCandidateIdx = 0;

  // ── (a) Generate placements ───────────────────────────────

  const placements: OrgPlacementResult[] = requirements.map((req) => {
    const jobSeed = seedHash(req.detailJobId);
    const jobRng = new SeededRandom(jobSeed + baseSeed);

    // Sometimes under-fulfill: 80% chance full, 20% chance short by 1
    const shortage = req.headcount >= 3 && jobRng.next() < 0.2 ? 1 : 0;
    const placedCount = Math.max(1, req.headcount - shortage);

    const candidates: OrgCandidate[] = [];
    for (let i = 0; i < placedCount; i++) {
      // Pick a unique name
      let name = jobRng.pick(NAMES);
      let attempts = 0;
      while (usedNames.has(name) && attempts < NAMES.length) {
        name = jobRng.pick(NAMES);
        attempts++;
      }
      if (usedNames.has(name)) {
        // Fallback: append a suffix
        name = name + String(globalCandidateIdx);
      }
      usedNames.add(name);

      const careerYears = jobRng.intRange(3, 20);
      const cl: 'CL3' | 'CL4' | 'CL5' = careerYears <= 6 ? 'CL3' : careerYears <= 13 ? 'CL4' : 'CL5';
      const matchScore = jobRng.intRange(62, 95);
      const currentCompetencyScore = jobRng.intRange(55, 90);
      const rndAlignment = jobRng.intRange(60, 98);

      const strengths = jobRng.pickN(pool.competencyAreas, jobRng.intRange(2, 4));
      const remainingAreas = pool.competencyAreas.filter(a => !strengths.includes(a));
      const gapAreas = jobRng.pickN(remainingAreas, jobRng.intRange(1, 3));

      candidates.push({
        id: `cand_${subJob}_${req.detailJobId}_${globalCandidateIdx}`,
        name,
        currentTeam: jobRng.pick(pool.teams),
        currentDamDang: jobRng.pick(pool.damDangs),
        cl,
        careerYears,
        matchScore,
        currentCompetencyScore,
        techPillar: jobRng.pick(pool.techPillars),
        strengths,
        gapAreas,
        rndAlignment,
      });
      globalCandidateIdx++;
    }

    const avgPlacedScore = candidates.length > 0
      ? Math.round(candidates.reduce((s, c) => s + c.currentCompetencyScore, 0) / candidates.length)
      : 0;
    const scoreGap = req.targetScore - avgPlacedScore;
    const fulfillmentRate = candidates.length / req.headcount;

    return {
      detailJobId: req.detailJobId,
      detailJobName: req.detailJobName,
      subItems: req.subItems,
      description: req.description,
      requestedHeadcount: req.headcount,
      targetScore: req.targetScore,
      candidates,
      avgPlacedScore,
      scoreGap,
      fulfillmentRate,
    };
  });

  // Collect all placed candidates across all placements
  const allCandidates = placements.flatMap(p => p.candidates);

  // ── (b) Source team impacts ────────────────────────────────

  const teamCandidateMap = new Map<string, OrgCandidate[]>();
  for (const c of allCandidates) {
    const arr = teamCandidateMap.get(c.currentTeam) || [];
    arr.push(c);
    teamCandidateMap.set(c.currentTeam, arr);
  }

  const sourceTeamImpacts: SourceTeamImpact[] = [];
  for (const [teamName, cands] of teamCandidateMap.entries()) {
    const teamSeedRng = new SeededRandom(seedHash(teamName) + baseSeed);
    const currentHeadcount = teamSeedRng.intRange(18, 45);
    const minimumRequired = Math.max(10, Math.round(currentHeadcount * 0.6));
    const pulledCount = cands.length;
    const remainingCount = currentHeadcount - pulledCount;
    const riskRatio = remainingCount / minimumRequired;
    const riskLevel: 'high' | 'medium' | 'low' =
      riskRatio < 1.0 ? 'high' : riskRatio < 1.2 ? 'medium' : 'low';

    const affectedRoles = teamSeedRng.pickN(pool.roles, Math.min(pulledCount, pool.roles.length));

    sourceTeamImpacts.push({
      teamName,
      damDangName: cands[0].currentDamDang,
      currentHeadcount,
      pulledCount,
      remainingCount,
      minimumRequired,
      riskLevel,
      affectedRoles,
    });
  }

  // ── (c) 담당 risks ────────────────────────────────────────

  const damDangTeamMap = new Map<string, SourceTeamImpact[]>();
  for (const impact of sourceTeamImpacts) {
    const arr = damDangTeamMap.get(impact.damDangName) || [];
    arr.push(impact);
    damDangTeamMap.set(impact.damDangName, arr);
  }

  const damDangRisks: DamDangRisk[] = [];
  for (const [damDangName, impacts] of damDangTeamMap.entries()) {
    const teams = impacts.map(imp => ({
      teamName: imp.teamName,
      pulled: imp.pulledCount,
      remaining: imp.remainingCount,
      riskLevel: imp.riskLevel,
    }));
    const totalCurrentHeadcount = impacts.reduce((s, i) => s + i.currentHeadcount, 0);
    const totalPulled = impacts.reduce((s, i) => s + i.pulledCount, 0);
    const totalRemaining = totalCurrentHeadcount - totalPulled;
    const minimumRequired = impacts.reduce((s, i) => s + i.minimumRequired, 0);
    const overallRiskRatio = totalRemaining / minimumRequired;
    const riskLevel: 'high' | 'medium' | 'low' =
      overallRiskRatio < 1.0 ? 'high' : overallRiskRatio < 1.2 ? 'medium' : 'low';

    damDangRisks.push({
      damDangName,
      teams,
      totalCurrentHeadcount,
      totalPulled,
      totalRemaining,
      minimumRequired,
      riskLevel,
    });
  }

  // ── (d) Competency gaps ────────────────────────────────────

  const competencyGaps: CompetencyGapItem[] = [];
  for (const placement of placements) {
    const gapRng = new SeededRandom(seedHash(placement.detailJobId + '_gap') + baseSeed);

    // Take 1-2 competency areas relevant to this detail job
    const relevantAreas = gapRng.pickN(pool.competencyAreas, gapRng.intRange(1, 2));

    for (const area of relevantAreas) {
      const requiredLevel = placement.targetScore;
      const currentAvg = Math.max(30, requiredLevel - gapRng.intRange(3, 22));
      const gap = requiredLevel - currentAvg;
      const priority: 'critical' | 'important' | 'normal' =
        gap >= 15 ? 'critical' : gap >= 8 ? 'important' : 'normal';

      const timeframe = priority === 'critical' ? '6~12개월' :
        priority === 'important' ? '3~6개월' : '1~3개월';

      competencyGaps.push({
        competencyName: `${placement.detailJobName} - ${area}`,
        requiredLevel,
        currentAvg,
        gap,
        priority,
        developmentPlan: gapRng.pick(DEVELOPMENT_PLANS),
        timeframe,
      });
    }
  }

  // Sort by gap descending
  competencyGaps.sort((a, b) => b.gap - a.gap);

  // ── (e) Career development proposals ───────────────────────

  const careerCandidates = rng.pickN(allCandidates, Math.min(rng.intRange(5, 8), allCandidates.length));
  const careerDevelopments: CareerDevelopment[] = careerCandidates.map(cand => {
    const cdRng = new SeededRandom(seedHash(cand.id + '_career') + baseSeed);

    const strengths = cand.strengths.map(s => ({
      area: s,
      level: cdRng.intRange(65, 92),
    }));

    const developmentAreas = cand.gapAreas.map(area => {
      const currentLevel = cdRng.intRange(35, 55);
      const targetLevel = cdRng.intRange(70, 90);
      const suggestions = [
        `${area} 분야 심화 교육 이수 및 실습 프로젝트 참여`,
        `${area} 전문가 멘토링을 통한 체계적 역량 향상`,
        `${area} 관련 사내외 기술 세미나 참가 및 네트워크 구축`,
        `${area} 실무 프로젝트 참여를 통한 현장 역량 강화`,
        `${area} 분야 선진 기술 벤치마킹 및 자체 연구 수행`,
      ];
      return {
        area,
        currentLevel,
        targetLevel,
        suggestion: cdRng.pick(suggestions),
      };
    });

    return {
      candidateId: cand.id,
      candidateName: cand.name,
      cl: cand.cl,
      currentRole: `${cand.currentTeam} ${cdRng.pick(pool.roles)}`,
      strengths,
      rndDirection: cdRng.pick(RND_DIRECTIONS),
      careerPath: cdRng.pick(CAREER_PATHS),
      developmentAreas,
    };
  });

  // ── (f) Hiring recommendations ─────────────────────────────

  const hiringRecommendations: { detailJobName: string; count: number; reason: string }[] = [];
  for (const placement of placements) {
    const unfilled = placement.requestedHeadcount - placement.candidates.length;
    if (unfilled > 0) {
      hiringRecommendations.push({
        detailJobName: placement.detailJobName,
        count: unfilled,
        reason: `${placement.detailJobName} 직무에 적합한 내부 인력이 부족하여 ${unfilled}명의 외부 채용이 필요합니다. 경력 ${rng.intRange(3, 7)}년 이상의 해당 분야 전문가를 우선 채용할 것을 권장합니다.`,
      });
    }
    if (placement.scoreGap > 10) {
      const additionalCount = Math.ceil(placement.scoreGap / 15);
      hiringRecommendations.push({
        detailJobName: placement.detailJobName,
        count: additionalCount,
        reason: `${placement.detailJobName} 역량 점수 gap(${placement.scoreGap}점)이 크므로, 상위 역량 보유자 ${additionalCount}명 추가 채용을 통해 조직 평균 역량을 보강할 것을 권장합니다.`,
      });
    }
  }

  // ── (g) Development recommendations ────────────────────────

  const developmentRecommendations: { candidateName: string; area: string; plan: string; timeframe: string }[] = [];
  for (const cand of allCandidates) {
    if (cand.gapAreas.length > 0) {
      const devRng = new SeededRandom(seedHash(cand.id + '_dev') + baseSeed);
      const primaryGap = cand.gapAreas[0];
      const plans = [
        `${primaryGap} 분야 집중 교육 프로그램 이수 (사내 R&D Academy)`,
        `${primaryGap} 전문가 지도 하 OJT 6개월 과정 참여`,
        `${primaryGap} 관련 선행 연구 프로젝트 참여를 통한 실무 역량 강화`,
        `${primaryGap} 기술 세미나 시리즈 수강 및 실습 과제 수행`,
        `${primaryGap} 분야 사내 인증 자격 취득 프로그램 참여`,
      ];
      const timeframes = ['3~6개월', '6~9개월', '6~12개월', '3개월', '9~12개월'];
      developmentRecommendations.push({
        candidateName: cand.name,
        area: primaryGap,
        plan: devRng.pick(plans),
        timeframe: devRng.pick(timeframes),
      });
    }
  }

  // ── (h) Overall summary ────────────────────────────────────

  const totalRequested = requirements.reduce((s, r) => s + r.headcount, 0);
  const totalPlaced = allCandidates.length;
  const fulfillmentRate = totalRequested > 0 ? totalPlaced / totalRequested : 0;
  const avgMatchScore = allCandidates.length > 0
    ? Math.round(allCandidates.reduce((s, c) => s + c.matchScore, 0) / allCandidates.length)
    : 0;

  const avgTargetScoreAll = requirements.length > 0
    ? requirements.reduce((s, r) => s + r.targetScore, 0) / requirements.length
    : 0;
  const avgPlacedScoreAll = placements.length > 0
    ? placements.reduce((s, p) => s + p.avgPlacedScore, 0) / placements.length
    : 0;
  const competencyFillRate = avgTargetScoreAll > 0
    ? Math.min(1, avgPlacedScoreAll / avgTargetScoreAll)
    : 0;

  const newHiringNeeded = hiringRecommendations.reduce((s, r) => s + r.count, 0);
  const developmentNeeded = developmentRecommendations.length;
  const riskTeamCount = sourceTeamImpacts.filter(t => t.riskLevel === 'high').length;

  // Weighted overall score: 40% match, 30% fulfillment, 20% competency fill, 10% low risk
  const riskFreeRate = sourceTeamImpacts.length > 0
    ? sourceTeamImpacts.filter(t => t.riskLevel === 'low').length / sourceTeamImpacts.length
    : 1;
  const overallScore = Math.round(
    avgMatchScore * 0.4 +
    fulfillmentRate * 100 * 0.3 +
    competencyFillRate * 100 * 0.2 +
    riskFreeRate * 100 * 0.1
  );

  const summary: OrgSimSummary = {
    overallScore,
    totalRequested,
    totalPlaced,
    fulfillmentRate: Math.round(fulfillmentRate * 100) / 100,
    avgMatchScore,
    competencyFillRate: Math.round(competencyFillRate * 100) / 100,
    newHiringNeeded,
    developmentNeeded,
    riskTeamCount,
  };

  return {
    summary,
    placements,
    sourceTeamImpacts,
    damDangRisks,
    competencyGaps,
    careerDevelopments,
    hiringRecommendations,
    developmentRecommendations,
  };
}
