export type MiddleJob = "소자" | "공정";
export const DEVICE_SUB_JOBS = ["PI", "Device", "FA"] as const;
export const PROCESS_SUB_JOBS = [
  "Photo공정",
  "Etch공정",
  "Diffusion공정",
  "ThinFilm공정",
  "C&C공정",
] as const;
export const KNOWN_TF_SUB_JOBS = [...DEVICE_SUB_JOBS, ...PROCESS_SUB_JOBS] as const;
export type SubJobDevice = (typeof DEVICE_SUB_JOBS)[number];
export type SubJobProcess = (typeof PROCESS_SUB_JOBS)[number];
export type KnownSubJob = (typeof KNOWN_TF_SUB_JOBS)[number];
export type SubJob = KnownSubJob | string;

export function isKnownSubJob(subJob: string): subJob is KnownSubJob {
  return (KNOWN_TF_SUB_JOBS as readonly string[]).includes(subJob);
}

export function getMiddleJobBySubJob(subJob: string, fallback: MiddleJob = "소자"): MiddleJob {
  if ((DEVICE_SUB_JOBS as readonly string[]).includes(subJob)) return "소자";
  if ((PROCESS_SUB_JOBS as readonly string[]).includes(subJob)) return "공정";
  return fallback;
}

export function getOrderedTfSubJobs(template: Pick<TFTemplate, "jobDistribution" | "jobCompetencies" | "targetCompetencyScores" | "competencyScores">): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  KNOWN_TF_SUB_JOBS.forEach((subJob) => {
    const exists =
      template.jobDistribution.some((item) => item.subJob === subJob) ||
      template.jobCompetencies.some((item) => item.subJob === subJob) ||
      template.targetCompetencyScores.some((item) => item.subJob === subJob) ||
      template.competencyScores.some((item) => item.subJob === subJob);

    if (exists) {
      seen.add(subJob);
      ordered.push(subJob);
    }
  });

  const extras = [
    ...template.jobDistribution.map((item) => item.subJob),
    ...template.jobCompetencies.map((item) => item.subJob),
    ...template.targetCompetencyScores.map((item) => item.subJob),
    ...template.competencyScores.map((item) => item.subJob),
  ].filter((subJob) => {
    if (seen.has(subJob)) return false;
    seen.add(subJob);
    return true;
  });

  return [...ordered, ...extras];
}

export interface JobDistribution {
  middleJob: MiddleJob;
  subJob: SubJob;
  count: number;        // 현재 배치 인원
  targetCount: number;  // 필요(목표) 인원
}

export interface Skill {
  name: string;
  level: number; // 1-5
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  middleJob: MiddleJob;
  subJob: SubJob;
  careerYears: number;
  skills: Skill[];
  projects: string[];
  specialization: string;
  available: boolean;
}

export interface RequiredRole {
  title: string;
  count: number;
  requiredSkills: string[];
  minCareerYears: number;
  description: string;
}

export type CareerLevel = 'CL2' | 'CL3' | 'CL4' | 'CL5';

export interface CareerLevelRequirement {
  CL2: number;
  CL3: number;
  CL4: number;
  CL5: number;
}

export interface CompetencyScore {
  subJob: SubJob;
  score: number; // 0–100
}

export interface JobCompetency {
  subJob: SubJob;
  requiredSkills: string[];
  responsibility: string;
  minCareerYears: number;
  minCareerYearsByLevel?: CareerLevelRequirement;
  averageTechTfYears?: number;
}

export type PlatformStage = 1 | 2 | 3;

export interface TFSpecialFactors {
  techSequence: number;
  platformSeries: string;
  platformStage: PlatformStage;
  nuddRatio: number;
  platformContextLabel?: string;
  platformKeyFocus?: string;
  platformUndecided?: boolean;
}

export interface TFTemplate {
  id: string;
  name: string;
  description: string;
  totalHeadcount: number;
  specialFactors?: TFSpecialFactors;
  jobDistribution: JobDistribution[];
  targetCompetencyScores: CompetencyScore[];  // 필요 역량 (목표)
  competencyScores: CompetencyScore[];         // 배치 후 역량 (실제)
  jobCompetencies: JobCompetency[];
  requiredRoles: RequiredRole[];
}

export function getPlatformStageLabel(platformStage: PlatformStage): string {
  if (platformStage === 1) return "1차 Tech";
  if (platformStage === 2) return "2차 Tech";
  return "3차 Tech";
}

export function getTemplateSpecialFactors(template: Pick<TFTemplate, "specialFactors">): TFSpecialFactors {
  return template.specialFactors ?? {
    techSequence: 0,
    platformSeries: "차기 Tech Platform 미정",
    platformStage: 2,
    nuddRatio: 0.25,
    platformContextLabel: "적용 Tech Platform 정보 미입력",
    platformUndecided: true,
  };
}

/** CL3 · CL4 · CL5 직급 체계 변환 */
export function getCareerLevel(position: string): "CL3" | "CL4" | "CL5" {
  if (position.includes("수석")) return "CL5";
  if (position.includes("책임")) return "CL4";
  return "CL3";
}

export interface CandidateScore {
  employee: Employee;
  matchScore: number;
  skillScores: { skill: string; score: number }[];
}

export interface RoleRecommendation {
  role: RequiredRole;
  recommended: CandidateScore[];
  alternatives: CandidateScore[];
}

// ── Employees ──────────────────────────────────────────

export const employees: Employee[] = [
  {
    id: "E001",
    name: "김태현",
    position: "수석연구원",
    department: "DRAM 개발실",
    middleJob: "소자",
    subJob: "Device",
    careerYears: 18,
    skills: [
      { name: "DRAM Cell 설계", level: 5 },
      { name: "회로 설계", level: 4 },
      { name: "SPICE 시뮬레이션", level: 4 },
      { name: "공정 통합", level: 4 },
      { name: "HBM 스태킹", level: 3 },
    ],
    projects: ["DDR5 DRAM 개발", "1a DRAM 양산", "HBM3 설계 자문"],
    specialization: "DRAM 셀 구조 설계 및 차세대 메모리 아키텍처",
    available: true,
  },
  {
    id: "E002",
    name: "이수진",
    position: "책임연구원",
    department: "PKG 개발실",
    middleJob: "공정",
    subJob: "ThinFilm공정",
    careerYears: 12,
    skills: [
      { name: "TSV 공정", level: 5 },
      { name: "HBM 스태킹", level: 4 },
      { name: "웨이퍼 본딩", level: 4 },
      { name: "마이크로 범프", level: 4 },
      { name: "열 관리", level: 3 },
    ],
    projects: ["HBM3 TSV 공정 개발", "2.5D 패키징 연구", "Fan-Out 웨이퍼 레벨 패키징"],
    specialization: "TSV 기반 고대역폭 메모리 패키징",
    available: true,
  },
  {
    id: "E003",
    name: "박준호",
    position: "책임연구원",
    department: "DRAM 개발실",
    middleJob: "소자",
    subJob: "Device",
    careerYears: 14,
    skills: [
      { name: "회로 설계", level: 5 },
      { name: "레이아웃 설계", level: 4 },
      { name: "Signal Integrity", level: 4 },
      { name: "SPICE 시뮬레이션", level: 4 },
      { name: "전력 관리", level: 3 },
    ],
    projects: ["DDR5 PHY 회로 설계", "LPDDR5X 개발", "고속 I/O 설계"],
    specialization: "고속 메모리 인터페이스 회로 설계",
    available: true,
  },
  {
    id: "E004",
    name: "정민서",
    position: "선임연구원",
    department: "공정기술실",
    middleJob: "공정",
    subJob: "Etch공정",
    careerYears: 8,
    skills: [
      { name: "EUV 리소그래피", level: 4 },
      { name: "식각 공정", level: 4 },
      { name: "공정 통합", level: 3 },
      { name: "증착 공정", level: 3 },
    ],
    projects: ["EUV 1b 공정 적용", "식각 프로파일 최적화", "결함 저감 프로젝트"],
    specialization: "EUV 기반 미세 패터닝 공정",
    available: true,
  },
  {
    id: "E005",
    name: "최영준",
    position: "수석연구원",
    department: "NAND 개발실",
    middleJob: "소자",
    subJob: "PI",
    careerYears: 20,
    skills: [
      { name: "3D NAND 공정", level: 5 },
      { name: "공정 통합", level: 5 },
      { name: "String 설계", level: 4 },
      { name: "식각 공정", level: 4 },
      { name: "증착 공정", level: 3 },
    ],
    projects: ["238단 NAND 개발", "V-NAND 초기 개발", "NAND 공정 아키텍처 설계"],
    specialization: "3D NAND Flash 공정 통합 및 아키텍처",
    available: false,
  },
  {
    id: "E006",
    name: "한지영",
    position: "책임연구원",
    department: "AI/DT 추진실",
    middleJob: "소자",
    subJob: "FA",
    careerYears: 10,
    skills: [
      { name: "AI/ML", level: 5 },
      { name: "데이터 분석", level: 4 },
      { name: "수율 분석", level: 4 },
      { name: "성능 최적화", level: 3 },
    ],
    projects: ["AI 기반 수율 예측 시스템", "공정 이상 탐지 모델", "Smart Factory 데이터 분석"],
    specialization: "AI/ML 기반 반도체 공정 최적화",
    available: true,
  },
  {
    id: "E007",
    name: "서동욱",
    position: "선임연구원",
    department: "PKG 개발실",
    middleJob: "공정",
    subJob: "ThinFilm공정",
    careerYears: 7,
    skills: [
      { name: "마이크로 범프", level: 4 },
      { name: "웨이퍼 본딩", level: 4 },
      { name: "TSV 공정", level: 3 },
      { name: "열 관리", level: 3 },
    ],
    projects: ["HBM3E 범프 피치 미세화", "Cu Pillar 공정 개발", "TSV 신뢰성 평가"],
    specialization: "마이크로 범프 및 본딩 기술",
    available: true,
  },
  {
    id: "E008",
    name: "윤하나",
    position: "책임연구원",
    department: "품질/신뢰성실",
    middleJob: "소자",
    subJob: "FA",
    careerYears: 11,
    skills: [
      { name: "신뢰성 시험", level: 5 },
      { name: "불량 분석", level: 4 },
      { name: "수율 분석", level: 4 },
      { name: "DRAM Cell 설계", level: 2 },
    ],
    projects: ["DRAM 가속 수명 시험", "HBM 열 신뢰성 평가", "패키지 레벨 신뢰성"],
    specialization: "반도체 제품 신뢰성 평가 및 분석",
    available: true,
  },
  {
    id: "E009",
    name: "장성호",
    position: "수석연구원",
    department: "솔루션 개발실",
    middleJob: "소자",
    subJob: "PI",
    careerYears: 16,
    skills: [
      { name: "시스템 아키텍처", level: 5 },
      { name: "메모리 컨트롤러", level: 5 },
      { name: "펌웨어 개발", level: 4 },
      { name: "성능 최적화", level: 4 },
    ],
    projects: ["CXL 메모리 컨트롤러", "DDR5 컨트롤러 IP", "AI 가속기용 메모리 서브시스템"],
    specialization: "차세대 메모리 시스템 아키텍처",
    available: true,
  },
  {
    id: "E010",
    name: "오미래",
    position: "선임연구원",
    department: "DRAM 개발실",
    middleJob: "소자",
    subJob: "Device",
    careerYears: 6,
    skills: [
      { name: "DRAM Cell 설계", level: 3 },
      { name: "SPICE 시뮬레이션", level: 4 },
      { name: "회로 설계", level: 3 },
      { name: "EUV 리소그래피", level: 3 },
    ],
    projects: ["1b DRAM Cell 최적화", "차세대 캐패시터 연구", "EUV 공정 적용 검증"],
    specialization: "DRAM 셀 시뮬레이션 및 최적화",
    available: true,
  },
  {
    id: "E011",
    name: "신현우",
    position: "책임연구원",
    department: "공정기술실",
    middleJob: "공정",
    subJob: "Diffusion공정",
    careerYears: 13,
    skills: [
      { name: "증착 공정", level: 5 },
      { name: "CMP", level: 4 },
      { name: "공정 통합", level: 4 },
      { name: "식각 공정", level: 4 },
    ],
    projects: ["ALD 박막 공정 개발", "High-K 유전체 증착", "CMP 슬러리 최적화"],
    specialization: "박막 증착 및 평탄화 공정",
    available: true,
  },
  {
    id: "E012",
    name: "강은지",
    position: "선임연구원",
    department: "AI/DT 추진실",
    middleJob: "소자",
    subJob: "FA",
    careerYears: 5,
    skills: [
      { name: "AI/ML", level: 4 },
      { name: "데이터 분석", level: 4 },
      { name: "성능 최적화", level: 3 },
      { name: "수율 분석", level: 3 },
    ],
    projects: ["설비 예지보전 AI", "SPC 이상 탐지", "공정 파라미터 최적화"],
    specialization: "반도체 데이터 분석 및 AI 모델링",
    available: true,
  },
  {
    id: "E013",
    name: "조태민",
    position: "책임연구원",
    department: "NAND 개발실",
    middleJob: "공정",
    subJob: "Etch공정",
    careerYears: 15,
    skills: [
      { name: "3D NAND 공정", level: 4 },
      { name: "식각 공정", level: 5 },
      { name: "증착 공정", level: 4 },
      { name: "CMP", level: 3 },
      { name: "공정 통합", level: 3 },
    ],
    projects: ["300+단 NAND 식각", "HAR 식각 기술 개발", "NAND 증착 균일도 개선"],
    specialization: "High Aspect Ratio 식각 기술",
    available: true,
  },
  {
    id: "E014",
    name: "임서연",
    position: "선임연구원",
    department: "솔루션 개발실",
    middleJob: "소자",
    subJob: "PI",
    careerYears: 9,
    skills: [
      { name: "펌웨어 개발", level: 4 },
      { name: "메모리 컨트롤러", level: 4 },
      { name: "성능 최적화", level: 4 },
      { name: "시스템 아키텍처", level: 3 },
    ],
    projects: ["SSD 펌웨어 개발", "UFS 컨트롤러 FW", "NVMe 성능 최적화"],
    specialization: "스토리지 펌웨어 및 컨트롤러 개발",
    available: true,
  },
  {
    id: "E015",
    name: "배정우",
    position: "책임연구원",
    department: "PKG 개발실",
    middleJob: "공정",
    subJob: "ThinFilm공정",
    careerYears: 12,
    skills: [
      { name: "HBM 스태킹", level: 5 },
      { name: "TSV 공정", level: 4 },
      { name: "열 관리", level: 4 },
      { name: "웨이퍼 본딩", level: 3 },
      { name: "마이크로 범프", level: 3 },
    ],
    projects: ["HBM3E 12단 스태킹", "TC-NCF 공정 개발", "HBM 열 솔루션 설계"],
    specialization: "HBM 다단 스태킹 기술",
    available: true,
  },
  {
    id: "E016",
    name: "류지현",
    position: "수석연구원",
    department: "품질/신뢰성실",
    middleJob: "소자",
    subJob: "FA",
    careerYears: 19,
    skills: [
      { name: "신뢰성 시험", level: 5 },
      { name: "불량 분석", level: 5 },
      { name: "수율 분석", level: 5 },
      { name: "공정 통합", level: 3 },
    ],
    projects: ["사내 신뢰성 표준 수립", "글로벌 품질 인증", "자동차용 메모리 인증"],
    specialization: "반도체 신뢰성 표준 및 인증",
    available: false,
  },
  {
    id: "E017",
    name: "홍승우",
    position: "선임연구원",
    department: "DRAM 개발실",
    middleJob: "소자",
    subJob: "Device",
    careerYears: 8,
    skills: [
      { name: "회로 설계", level: 4 },
      { name: "전력 관리", level: 4 },
      { name: "SPICE 시뮬레이션", level: 3 },
      { name: "Signal Integrity", level: 3 },
      { name: "열 관리", level: 3 },
    ],
    projects: ["LPDDR5 전력 최적화", "Sense Amp 설계", "On-die ECC 회로"],
    specialization: "저전력 메모리 회로 설계",
    available: true,
  },
  {
    id: "E018",
    name: "문다은",
    position: "책임연구원",
    department: "CIS 개발실",
    middleJob: "소자",
    subJob: "Device",
    careerYears: 11,
    skills: [
      { name: "Pixel 설계", level: 5 },
      { name: "아날로그 회로", level: 4 },
      { name: "회로 설계", level: 3 },
      { name: "SPICE 시뮬레이션", level: 3 },
    ],
    projects: ["50MP CIS 센서 개발", "저조도 성능 개선", "HDR 픽셀 구조 설계"],
    specialization: "CMOS 이미지 센서 픽셀 설계",
    available: true,
  },
  {
    id: "E019",
    name: "권혁진",
    position: "선임연구원",
    department: "공정기술실",
    middleJob: "공정",
    subJob: "Photo공정",
    careerYears: 7,
    skills: [
      { name: "EUV 리소그래피", level: 5 },
      { name: "공정 통합", level: 3 },
      { name: "식각 공정", level: 3 },
      { name: "증착 공정", level: 2 },
    ],
    projects: ["EUV 마스크 최적화", "OPC 보정 기술", "차세대 리소 공정 평가"],
    specialization: "EUV 리소그래피 최적화",
    available: true,
  },
  {
    id: "E020",
    name: "양수빈",
    position: "책임연구원",
    department: "솔루션 개발실",
    middleJob: "소자",
    subJob: "PI",
    careerYears: 10,
    skills: [
      { name: "시스템 아키텍처", level: 4 },
      { name: "성능 최적화", level: 4 },
      { name: "AI 가속기", level: 4 },
      { name: "메모리 컨트롤러", level: 3 },
      { name: "AI/ML", level: 3 },
    ],
    projects: ["PIM 아키텍처 설계", "NPU 메모리 인터페이스", "HPC 성능 벤치마크"],
    specialization: "AI 반도체 시스템 아키텍처",
    available: true,
  },
];

// ── TF Templates ───────────────────────────────────────

export const tfTemplates: TFTemplate[] = [
  {
    id: "TF001",
    name: "Adhara",
    description:
      "Adhara TF는 차세대 HBM4 제품 개발을 위한 핵심 기술 인력을 구성합니다.",
    totalHeadcount: 355,
    specialFactors: {
      techSequence: 5,
      platformSeries: "3rd Tech Platform",
      platformStage: 3,
      nuddRatio: 0.32,
      platformContextLabel: "Kapella · Altair · Adhara 구간",
      platformKeyFocus: "VG(Vertical Gate) 적용",
    },
    jobDistribution: [
      { middleJob: "소자", subJob: "PI",           count: 62, targetCount: 70 },
      { middleJob: "소자", subJob: "Device",       count: 85, targetCount: 95 },
      { middleJob: "소자", subJob: "FA",           count: 33, targetCount: 40 },
      { middleJob: "공정", subJob: "Photo공정",    count: 42, targetCount: 48 },
      { middleJob: "공정", subJob: "Etch공정",     count: 50, targetCount: 55 },
      { middleJob: "공정", subJob: "Diffusion공정",count: 38, targetCount: 42 },
      { middleJob: "공정", subJob: "ThinFilm공정", count: 30, targetCount: 38 },
      { middleJob: "공정", subJob: "C&C공정",      count: 15, targetCount: 18 },
    ],
    targetCompetencyScores: [
      { subJob: "PI",           score: 85 },
      { subJob: "Device",       score: 92 },
      { subJob: "FA",           score: 80 },
      { subJob: "Photo공정",    score: 80 },
      { subJob: "Etch공정",     score: 88 },
      { subJob: "Diffusion공정",score: 78 },
      { subJob: "ThinFilm공정", score: 82 },
      { subJob: "C&C공정",      score: 72 },
    ],
    competencyScores: [
      { subJob: "PI",           score: 78 },
      { subJob: "Device",       score: 85 },
      { subJob: "FA",           score: 72 },
      { subJob: "Photo공정",    score: 74 },
      { subJob: "Etch공정",     score: 80 },
      { subJob: "Diffusion공정",score: 71 },
      { subJob: "ThinFilm공정", score: 76 },
      { subJob: "C&C공정",      score: 65 },
    ],
    jobCompetencies: [
      { subJob: "PI",           requiredSkills: ["공정 통합", "TSV 공정", "수율 최적화"],           responsibility: "HBM4 공정 플로우 설계 및 TSV 통합 관리",           minCareerYears: 8 },
      { subJob: "Device",       requiredSkills: ["DRAM Cell 설계", "전기 특성 분석", "SPICE"],      responsibility: "HBM4 셀 구조 최적화 및 전기적 특성 평가",           minCareerYears: 6 },
      { subJob: "FA",           requiredSkills: ["불량 분석", "SEM/TEM 분석", "신뢰성 시험"],       responsibility: "HBM 스택 불량 분석 및 수율 저해 인자 규명",          minCareerYears: 5 },
      { subJob: "Photo공정",    requiredSkills: ["EUV 리소그래피", "OPC", "CD 균일도"],             responsibility: "HBM4 크리티컬 레이어 EUV 패터닝",                   minCareerYears: 5 },
      { subJob: "Etch공정",     requiredSkills: ["HAR 식각", "플라즈마 공정", "식각 선택비"],       responsibility: "TSV 및 미세 패턴 식각 프로파일 최적화",              minCareerYears: 5 },
      { subJob: "Diffusion공정",requiredSkills: ["ALD", "CVD", "열처리 공정"],                      responsibility: "HBM4 절연층 및 접합 형성 공정",                     minCareerYears: 4 },
      { subJob: "ThinFilm공정", requiredSkills: ["PVD", "CMP", "금속 배선"],                        responsibility: "TSV 금속화 및 마이크로 범프 공정",                   minCareerYears: 5 },
      { subJob: "C&C공정",      requiredSkills: ["세정 공정", "표면 처리", "파티클 제어"],           responsibility: "공정 간 오염 제어 및 표면 품질 관리",                minCareerYears: 3 },
    ],
    requiredRoles: [
      {
        title: "TF장",
        count: 1,
        requiredSkills: ["DRAM Cell 설계", "HBM 스태킹", "공정 통합"],
        minCareerYears: 15,
        description: "HBM4 개발 총괄. DRAM 설계 및 HBM 기술 전반에 대한 깊은 이해 필요",
      },
      {
        title: "TSV/패키징 전문가",
        count: 2,
        requiredSkills: ["TSV 공정", "마이크로 범프", "웨이퍼 본딩"],
        minCareerYears: 7,
        description: "TSV 및 미세 범프 기반 HBM 스태킹 공정 개발",
      },
      {
        title: "DRAM 설계 전문가",
        count: 1,
        requiredSkills: ["DRAM Cell 설계", "회로 설계", "SPICE 시뮬레이션"],
        minCareerYears: 5,
        description: "HBM4용 DRAM 다이 셀/회로 설계 및 최적화",
      },
      {
        title: "열/전력 분석 전문가",
        count: 1,
        requiredSkills: ["열 관리", "전력 관리", "Signal Integrity"],
        minCareerYears: 5,
        description: "HBM4 스택의 열/전력 시뮬레이션 및 최적화",
      },
      {
        title: "테스트/신뢰성 전문가",
        count: 1,
        requiredSkills: ["신뢰성 시험", "불량 분석"],
        minCareerYears: 8,
        description: "HBM4 제품의 신뢰성 평가 및 불량 분석 체계 구축",
      },
    ],
  },
  {
    id: "TF002",
    name: "Big Dipper",
    description:
      "Big Dipper TF는 1c nm 공정 기반 차세대 DRAM 제품 개발 인력을 구성합니다. EUV 공정 적용 확대 및 셀 미세화 기술 확보가 핵심 목표입니다.",
    totalHeadcount: 342,
    specialFactors: {
      techSequence: 6,
      platformSeries: "차기 Tech Platform 미정",
      platformStage: 2,
      nuddRatio: 0.22,
      platformContextLabel: "Adhara 이후 적용 Platform 미정",
      platformUndecided: true,
    },
    jobDistribution: [
      { middleJob: "소자", subJob: "PI",           count: 70, targetCount: 80 },
      { middleJob: "소자", subJob: "Device",       count: 74, targetCount: 85 },
      { middleJob: "소자", subJob: "FA",           count: 28, targetCount: 32 },
      { middleJob: "공정", subJob: "Photo공정",    count: 52, targetCount: 62 },
      { middleJob: "공정", subJob: "Etch공정",     count: 44, targetCount: 50 },
      { middleJob: "공정", subJob: "Diffusion공정",count: 40, targetCount: 48 },
      { middleJob: "공정", subJob: "ThinFilm공정", count: 22, targetCount: 28 },
      { middleJob: "공정", subJob: "C&C공정",      count: 12, targetCount: 14 },
    ],
    targetCompetencyScores: [
      { subJob: "PI",           score: 90 },
      { subJob: "Device",       score: 88 },
      { subJob: "FA",           score: 76 },
      { subJob: "Photo공정",    score: 95 },
      { subJob: "Etch공정",     score: 85 },
      { subJob: "Diffusion공정",score: 90 },
      { subJob: "ThinFilm공정", score: 74 },
      { subJob: "C&C공정",      score: 70 },
    ],
    competencyScores: [
      { subJob: "PI",           score: 85 },
      { subJob: "Device",       score: 80 },
      { subJob: "FA",           score: 68 },
      { subJob: "Photo공정",    score: 88 },
      { subJob: "Etch공정",     score: 76 },
      { subJob: "Diffusion공정",score: 82 },
      { subJob: "ThinFilm공정", score: 65 },
      { subJob: "C&C공정",      score: 62 },
    ],
    jobCompetencies: [
      { subJob: "PI",           requiredSkills: ["EUV 공정 통합", "1c 공정 설계", "수율 최적화"],   responsibility: "1c nm EUV 공정 통합 및 수율 최적화",                 minCareerYears: 10 },
      { subJob: "Device",       requiredSkills: ["DRAM Cell 설계", "캐패시터 최적화", "누설 분석"], responsibility: "1c DRAM 셀 미세화 및 캐패시터 설계",                  minCareerYears: 7  },
      { subJob: "FA",           requiredSkills: ["EUV 결함 분석", "불량 분석", "수율 분석"],        responsibility: "1c 공정 결함 원인 분석 및 수율 개선",                minCareerYears: 5  },
      { subJob: "Photo공정",    requiredSkills: ["EUV 멀티 패터닝", "ILT/OPC", "레지스트 공정"],   responsibility: "1c DRAM 초미세 EUV 멀티 패터닝",                    minCareerYears: 7  },
      { subJob: "Etch공정",     requiredSkills: ["원자층 식각", "선택비 제어", "프로파일 제어"],     responsibility: "1c 패턴 정밀 식각 및 균일도 확보",                   minCareerYears: 6  },
      { subJob: "Diffusion공정",requiredSkills: ["저온 ALD", "불순물 제어", "접합 형성"],           responsibility: "1c DRAM 게이트 절연막 및 접합 형성",                 minCareerYears: 5  },
      { subJob: "ThinFilm공정", requiredSkills: ["Low-K 유전체", "금속 배선", "배리어 메탈"],       responsibility: "1c DRAM 다층 배선 및 유전체 형성",                   minCareerYears: 5  },
      { subJob: "C&C공정",      requiredSkills: ["FEOL 세정", "파티클 제어", "표면 개질"],           responsibility: "초미세 패턴 공정 오염 제어",                         minCareerYears: 3  },
    ],
    requiredRoles: [
      {
        title: "TF장",
        count: 1,
        requiredSkills: ["DRAM Cell 설계", "공정 통합"],
        minCareerYears: 15,
        description: "1c DRAM 개발 총괄. 셀 설계와 공정 통합 경험 필수",
      },
      {
        title: "Cell 설계 전문가",
        count: 2,
        requiredSkills: ["DRAM Cell 설계", "SPICE 시뮬레이션"],
        minCareerYears: 5,
        description: "1c 노드 DRAM 셀 구조 설계 및 시뮬레이션",
      },
      {
        title: "공정 전문가",
        count: 2,
        requiredSkills: ["EUV 리소그래피", "식각 공정", "증착 공정"],
        minCareerYears: 5,
        description: "EUV 기반 미세 공정 개발 및 최적화",
      },
      {
        title: "회로 설계 전문가",
        count: 1,
        requiredSkills: ["회로 설계", "레이아웃 설계", "전력 관리"],
        minCareerYears: 7,
        description: "Peripheral 회로 설계 및 레이아웃 최적화",
      },
      {
        title: "수율/신뢰성 전문가",
        count: 1,
        requiredSkills: ["수율 분석", "신뢰성 시험"],
        minCareerYears: 8,
        description: "공정 수율 분석 및 신뢰성 확보",
      },
    ],
  },
  {
    id: "TF003",
    name: "Pegasus",
    description:
      "Pegasus TF는 AI 가속기에 최적화된 메모리 솔루션 개발 인력을 구성합니다. PIM, CXL 등 차세대 메모리 인터페이스 및 AI 워크로드 대응 기술을 개발합니다.",
    totalHeadcount: 332,
    specialFactors: {
      techSequence: 7,
      platformSeries: "차기 Tech Platform 미정",
      platformStage: 2,
      nuddRatio: 0.48,
      platformContextLabel: "Adhara 이후 적용 Platform 미정",
      platformUndecided: true,
    },
    jobDistribution: [
      { middleJob: "소자", subJob: "PI",           count: 55, targetCount: 65 },
      { middleJob: "소자", subJob: "Device",       count: 92, targetCount: 100 },
      { middleJob: "소자", subJob: "FA",           count: 28, targetCount: 32 },
      { middleJob: "공정", subJob: "Photo공정",    count: 36, targetCount: 42 },
      { middleJob: "공정", subJob: "Etch공정",     count: 42, targetCount: 48 },
      { middleJob: "공정", subJob: "Diffusion공정",count: 32, targetCount: 36 },
      { middleJob: "공정", subJob: "ThinFilm공정", count: 35, targetCount: 42 },
      { middleJob: "공정", subJob: "C&C공정",      count: 12, targetCount: 15 },
    ],
    targetCompetencyScores: [
      { subJob: "PI",           score: 80 },
      { subJob: "Device",       score: 95 },
      { subJob: "FA",           score: 74 },
      { subJob: "Photo공정",    score: 78 },
      { subJob: "Etch공정",     score: 83 },
      { subJob: "Diffusion공정",score: 76 },
      { subJob: "ThinFilm공정", score: 86 },
      { subJob: "C&C공정",      score: 78 },
    ],
    competencyScores: [
      { subJob: "PI",           score: 72 },
      { subJob: "Device",       score: 90 },
      { subJob: "FA",           score: 65 },
      { subJob: "Photo공정",    score: 70 },
      { subJob: "Etch공정",     score: 75 },
      { subJob: "Diffusion공정",score: 68 },
      { subJob: "ThinFilm공정", score: 78 },
      { subJob: "C&C공정",      score: 70 },
    ],
    jobCompetencies: [
      { subJob: "PI",           requiredSkills: ["PIM 공정 통합", "CXL 공정 설계", "성능 최적화"],  responsibility: "AI 워크로드 최적화 메모리 공정 통합",                minCareerYears: 8 },
      { subJob: "Device",       requiredSkills: ["시스템 아키텍처", "AI 가속기 설계", "전력 분석"], responsibility: "PIM/CXL 메모리 디바이스 설계 및 검증",               minCareerYears: 7 },
      { subJob: "FA",           requiredSkills: ["AI 워크로드 분석", "성능 불량 분석", "수율 분석"],responsibility: "AI 메모리 성능 저해 인자 분석",                      minCareerYears: 5 },
      { subJob: "Photo공정",    requiredSkills: ["EUV 리소그래피", "CD 제어", "오버레이 관리"],     responsibility: "AI 메모리 고밀도 패터닝",                            minCareerYears: 5 },
      { subJob: "Etch공정",     requiredSkills: ["식각 균일도", "선택비 제어", "플라즈마 진단"],     responsibility: "AI 메모리 고집적 식각 공정",                         minCareerYears: 5 },
      { subJob: "Diffusion공정",requiredSkills: ["ALD", "산화막 성장", "열처리 최적화"],            responsibility: "AI 메모리 게이트 및 절연층 공정",                    minCareerYears: 4 },
      { subJob: "ThinFilm공정", requiredSkills: ["구리 배선", "저저항 금속", "CMP"],                responsibility: "AI 메모리 저저항 배선 형성",                         minCareerYears: 5 },
      { subJob: "C&C공정",      requiredSkills: ["세정 최적화", "잔류물 제거", "표면 활성화"],       responsibility: "AI 메모리 공정 세정 및 표면 관리",                   minCareerYears: 3 },
    ],
    requiredRoles: [
      {
        title: "TF장",
        count: 1,
        requiredSkills: ["시스템 아키텍처", "메모리 컨트롤러"],
        minCareerYears: 15,
        description: "AI 메모리 솔루션 개발 총괄",
      },
      {
        title: "메모리 컨트롤러 전문가",
        count: 1,
        requiredSkills: ["메모리 컨트롤러", "성능 최적화"],
        minCareerYears: 7,
        description: "AI 워크로드에 최적화된 메모리 컨트롤러 설계",
      },
      {
        title: "펌웨어 개발자",
        count: 1,
        requiredSkills: ["펌웨어 개발", "성능 최적화"],
        minCareerYears: 5,
        description: "메모리 서브시스템 펌웨어 개발 및 최적화",
      },
      {
        title: "AI/ML 전문가",
        count: 1,
        requiredSkills: ["AI/ML", "데이터 분석"],
        minCareerYears: 5,
        description: "AI 워크로드 분석 및 메모리 접근 패턴 최적화",
      },
      {
        title: "시스템 아키텍트",
        count: 1,
        requiredSkills: ["AI 가속기", "시스템 아키텍처", "성능 최적화"],
        minCareerYears: 7,
        description: "PIM/CXL 기반 차세대 메모리 아키텍처 설계",
      },
    ],
  },
  {
    id: "TF004",
    name: "Libra",
    description:
      "Libra TF는 300단급 이상 차세대 3D NAND Flash 기술 개발 인력을 구성합니다. HAR 식각, 고단 적층, 컨트롤러 기술이 핵심입니다.",
    totalHeadcount: 368,
    specialFactors: {
      techSequence: 8,
      platformSeries: "차기 Tech Platform 미정",
      platformStage: 2,
      nuddRatio: 0.34,
      platformContextLabel: "Adhara 이후 적용 Platform 미정",
      platformUndecided: true,
    },
    jobDistribution: [
      { middleJob: "소자", subJob: "PI",           count: 65, targetCount: 76 },
      { middleJob: "소자", subJob: "Device",       count: 72, targetCount: 80 },
      { middleJob: "소자", subJob: "FA",           count: 45, targetCount: 55 },
      { middleJob: "공정", subJob: "Photo공정",    count: 46, targetCount: 54 },
      { middleJob: "공정", subJob: "Etch공정",     count: 62, targetCount: 72 },
      { middleJob: "공정", subJob: "Diffusion공정",count: 44, targetCount: 52 },
      { middleJob: "공정", subJob: "ThinFilm공정", count: 26, targetCount: 32 },
      { middleJob: "공정", subJob: "C&C공정",      count: 8,  targetCount: 10 },
    ],
    targetCompetencyScores: [
      { subJob: "PI",           score: 88 },
      { subJob: "Device",       score: 84 },
      { subJob: "FA",           score: 90 },
      { subJob: "Photo공정",    score: 86 },
      { subJob: "Etch공정",     score: 97 },
      { subJob: "Diffusion공정",score: 87 },
      { subJob: "ThinFilm공정", score: 78 },
      { subJob: "C&C공정",      score: 68 },
    ],
    competencyScores: [
      { subJob: "PI",           score: 80 },
      { subJob: "Device",       score: 76 },
      { subJob: "FA",           score: 82 },
      { subJob: "Photo공정",    score: 78 },
      { subJob: "Etch공정",     score: 92 },
      { subJob: "Diffusion공정",score: 80 },
      { subJob: "ThinFilm공정", score: 70 },
      { subJob: "C&C공정",      score: 60 },
    ],
    jobCompetencies: [
      { subJob: "PI",           requiredSkills: ["3D NAND 공정 통합", "HAR 공정 설계", "수율 관리"],  responsibility: "300단급 3D NAND 공정 통합 및 아키텍처 설계",          minCareerYears: 10 },
      { subJob: "Device",       requiredSkills: ["NAND Cell 설계", "String 구조 설계", "전하 트래핑"],responsibility: "고단 3D NAND 셀 구조 및 전기 특성 설계",              minCareerYears: 7  },
      { subJob: "FA",           requiredSkills: ["3D NAND 불량 분석", "단면 분석", "신뢰성 평가"],    responsibility: "Endurance/Retention 불량 분석 및 수율 개선",          minCareerYears: 6  },
      { subJob: "Photo공정",    requiredSkills: ["HAR 홀 패터닝", "EUV 리소그래피", "스텐실 공정"],   responsibility: "고단 NAND HAR 채널홀 패터닝",                         minCareerYears: 6  },
      { subJob: "Etch공정",     requiredSkills: ["HAR 식각", "ONON 식각", "식각 균일도"],             responsibility: "300단 HAR 채널홀 및 게이트 슬릿 식각",               minCareerYears: 8  },
      { subJob: "Diffusion공정",requiredSkills: ["ONO 증착", "폴리실리콘 증착", "열처리"],            responsibility: "전하 트랩층 및 터널 산화막 형성",                    minCareerYears: 6  },
      { subJob: "ThinFilm공정", requiredSkills: ["텅스텐 매립", "CMP", "금속 배선"],                  responsibility: "3D NAND 워드라인 금속 매립 및 배선",                  minCareerYears: 5  },
      { subJob: "C&C공정",      requiredSkills: ["HAR 세정", "잔류 폴리머 제거", "습식 세정"],         responsibility: "HAR 공정 후 세정 및 잔류물 관리",                     minCareerYears: 4  },
    ],
    requiredRoles: [
      {
        title: "TF장",
        count: 1,
        requiredSkills: ["3D NAND 공정", "공정 통합"],
        minCareerYears: 15,
        description: "차세대 NAND 개발 총괄",
      },
      {
        title: "공정 전문가",
        count: 2,
        requiredSkills: ["식각 공정", "증착 공정", "CMP"],
        minCareerYears: 7,
        description: "HAR 식각, 고단 적층 증착/평탄화 공정 개발",
      },
      {
        title: "String 설계 전문가",
        count: 1,
        requiredSkills: ["String 설계", "회로 설계"],
        minCareerYears: 5,
        description: "NAND String 구조 설계 및 최적화",
      },
      {
        title: "컨트롤러/FW 전문가",
        count: 1,
        requiredSkills: ["메모리 컨트롤러", "펌웨어 개발"],
        minCareerYears: 5,
        description: "NAND 컨트롤러 및 FTL 펌웨어 개발",
      },
      {
        title: "신뢰성 전문가",
        count: 1,
        requiredSkills: ["신뢰성 시험", "수율 분석"],
        minCareerYears: 8,
        description: "NAND Endurance/Retention 신뢰성 평가",
      },
    ],
  },
  {
    id: "TF005",
    name: "Leo",
    description:
      "Leo TF는 CXL 기반 차세대 메모리 인터페이스 및 PIM(Processing-In-Memory) 솔루션 개발 인력을 구성합니다. 호스트-메모리 간 대역폭·지연 최적화가 핵심 목표입니다.",
    totalHeadcount: 341,
    specialFactors: {
      techSequence: 9,
      platformSeries: "차기 Tech Platform 미정",
      platformStage: 2,
      nuddRatio: 0.41,
      platformContextLabel: "Adhara 이후 적용 Platform 미정",
      platformUndecided: true,
    },
    jobDistribution: [
      { middleJob: "소자", subJob: "PI",           count: 52, targetCount: 62 },
      { middleJob: "소자", subJob: "Device",       count: 88, targetCount: 98 },
      { middleJob: "소자", subJob: "FA",           count: 32, targetCount: 38 },
      { middleJob: "공정", subJob: "Photo공정",    count: 40, targetCount: 46 },
      { middleJob: "공정", subJob: "Etch공정",     count: 44, targetCount: 50 },
      { middleJob: "공정", subJob: "Diffusion공정",count: 38, targetCount: 44 },
      { middleJob: "공정", subJob: "ThinFilm공정", count: 35, targetCount: 42 },
      { middleJob: "공정", subJob: "C&C공정",      count: 12, targetCount: 15 },
    ],
    targetCompetencyScores: [
      { subJob: "PI",           score: 83 },
      { subJob: "Device",       score: 94 },
      { subJob: "FA",           score: 78 },
      { subJob: "Photo공정",    score: 80 },
      { subJob: "Etch공정",     score: 82 },
      { subJob: "Diffusion공정",score: 83 },
      { subJob: "ThinFilm공정", score: 90 },
      { subJob: "C&C공정",      score: 76 },
    ],
    competencyScores: [
      { subJob: "PI",           score: 75 },
      { subJob: "Device",       score: 88 },
      { subJob: "FA",           score: 70 },
      { subJob: "Photo공정",    score: 72 },
      { subJob: "Etch공정",     score: 73 },
      { subJob: "Diffusion공정",score: 75 },
      { subJob: "ThinFilm공정", score: 82 },
      { subJob: "C&C공정",      score: 68 },
    ],
    jobCompetencies: [
      { subJob: "PI",           requiredSkills: ["CXL 공정 통합", "인터페이스 공정 설계", "수율 관리"],responsibility: "CXL 메모리 인터페이스 공정 통합",                    minCareerYears: 8 },
      { subJob: "Device",       requiredSkills: ["CXL 컨트롤러 설계", "PIM 아키텍처", "인터페이스"],  responsibility: "CXL 기반 PIM 디바이스 설계 및 검증",                 minCareerYears: 7 },
      { subJob: "FA",           requiredSkills: ["인터페이스 불량 분석", "신호 무결성", "신뢰성 평가"],responsibility: "CXL/PIM 인터페이스 불량 및 신뢰성 분석",             minCareerYears: 5 },
      { subJob: "Photo공정",    requiredSkills: ["EUV 리소그래피", "고정밀 오버레이", "CD 제어"],      responsibility: "CXL 메모리 고밀도 인터커넥트 패터닝",                minCareerYears: 5 },
      { subJob: "Etch공정",     requiredSkills: ["비아 식각", "식각 선택비", "플라즈마 제어"],          responsibility: "CXL 인터커넥트 비아 및 트렌치 식각",                 minCareerYears: 5 },
      { subJob: "Diffusion공정",requiredSkills: ["저온 공정", "ALD", "열안정성 관리"],                 responsibility: "CXL 메모리 백엔드 절연층 형성",                      minCareerYears: 4 },
      { subJob: "ThinFilm공정", requiredSkills: ["Cu 다마신", "저저항 배선", "배리어 메탈"],            responsibility: "CXL 고속 인터커넥트 구리 배선 형성",                 minCareerYears: 6 },
      { subJob: "C&C공정",      requiredSkills: ["후단 세정", "Cu 표면 처리", "결함 제어"],             responsibility: "CXL 인터커넥트 공정 세정 및 결함 관리",              minCareerYears: 3 },
    ],
    requiredRoles: [
      {
        title: "TF장",
        count: 1,
        requiredSkills: ["시스템 아키텍처", "메모리 컨트롤러"],
        minCareerYears: 15,
        description: "CXL/PIM 개발 총괄. 메모리 시스템 아키텍처 설계 경험 필수",
      },
      {
        title: "인터페이스/컨트롤러 전문가",
        count: 1,
        requiredSkills: ["메모리 컨트롤러", "Signal Integrity", "시스템 아키텍처"],
        minCareerYears: 7,
        description: "CXL 프로토콜 기반 메모리 컨트롤러 설계 및 인터페이스 최적화",
      },
      {
        title: "펌웨어 개발자",
        count: 1,
        requiredSkills: ["펌웨어 개발", "성능 최적화"],
        minCareerYears: 5,
        description: "CXL 디바이스 펌웨어 및 호스트 드라이버 개발",
      },
      {
        title: "AI 워크로드 분석가",
        count: 1,
        requiredSkills: ["AI/ML", "성능 최적화", "데이터 분석"],
        minCareerYears: 5,
        description: "AI/HPC 워크로드의 메모리 접근 패턴 분석 및 최적화",
      },
      {
        title: "신뢰성 전문가",
        count: 1,
        requiredSkills: ["신뢰성 시험", "불량 분석"],
        minCareerYears: 8,
        description: "CXL 메모리 모듈 신뢰성 검증 및 인증",
      },
    ],
  },
];

// ── Recommendation Engine ──────────────────────────────

export function generateRecommendations(
  template: TFTemplate,
  allEmployees: Employee[] = employees
): RoleRecommendation[] {
  const availablePool = allEmployees.filter((e) => e.available);
  const assigned = new Set<string>();
  const results: RoleRecommendation[] = [];

  for (const role of template.requiredRoles) {
    const candidates = availablePool
      .filter((e) => !assigned.has(e.id))
      .map((e) => {
        const skillScores = role.requiredSkills.map((reqSkill) => {
          const empSkill = e.skills.find((s) => s.name === reqSkill);
          return { skill: reqSkill, score: empSkill ? empSkill.level : 0 };
        });

        const skillAvg =
          skillScores.reduce((sum, s) => sum + s.score, 0) / skillScores.length;
        const skillMatch = (skillAvg / 5) * 70;

        const careerFit =
          role.minCareerYears > 0
            ? Math.min(e.careerYears / role.minCareerYears, 1.5) * 20
            : 15;

        const extraBonus = Math.min(
          e.skills.filter(
            (s) => !role.requiredSkills.includes(s.name) && s.level >= 3
          ).length * 2,
          10
        );

        const matchScore = Math.round(
          Math.min(skillMatch + careerFit + extraBonus, 100)
        );

        return { employee: e, matchScore, skillScores };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    const recommended = candidates.slice(0, role.count);
    const alternatives = candidates.slice(role.count, role.count + 3);

    recommended.forEach((r) => assigned.add(r.employee.id));

    results.push({ role, recommended, alternatives });
  }

  return results;
}

// ── Function 조직 (TD · 공정) 인력 차출 영향 ─────────────────────

export type FunctionMiddle = "TD" | "공정";
export type FunctionRiskLevel = "high" | "medium" | "low";

export interface FunctionOrgBaselineItem {
  subJob: SubJob;
  functionMiddle: FunctionMiddle;
  originalCount: number;     // Function 조직 현재 인력
  minimumRequired: number;   // 정상 운영 최소 필요 인력
  competencyBefore: number;  // 차출 전 조직 역량 Score
}

/**
 * Function 조직(TD · 공정) 기준 인력 및 역량.
 * 모든 TF 시뮬레이션의 공통 베이스라인.
 * TD: PI · Device · FA  /  공정: Photo · Etch · Diffusion · ThinFilm · C&C
 */
export const functionOrgBaseline: FunctionOrgBaselineItem[] = [
  { subJob: "PI",            functionMiddle: "TD",   originalCount: 150, minimumRequired: 100, competencyBefore: 86 },
  { subJob: "Device",        functionMiddle: "TD",   originalCount: 200, minimumRequired: 140, competencyBefore: 88 },
  { subJob: "FA",            functionMiddle: "TD",   originalCount: 85,  minimumRequired: 60,  competencyBefore: 80 },
  { subJob: "Photo공정",     functionMiddle: "공정", originalCount: 130, minimumRequired: 95,  competencyBefore: 85 },
  { subJob: "Etch공정",      functionMiddle: "공정", originalCount: 120, minimumRequired: 88,  competencyBefore: 82 },
  { subJob: "Diffusion공정", functionMiddle: "공정", originalCount: 95,  minimumRequired: 70,  competencyBefore: 80 },
  { subJob: "ThinFilm공정",  functionMiddle: "공정", originalCount: 70,  minimumRequired: 52,  competencyBefore: 78 },
  { subJob: "C&C공정",       functionMiddle: "공정", originalCount: 45,  minimumRequired: 32,  competencyBefore: 74 },
];

export interface FunctionOrgPullItem {
  subJob: SubJob;
  pulledCount: number;     // 이 TF에 차출되는 인원
  competencyDrop: number;  // 핵심 인력 차출로 인한 예상 역량 하락 pt
}

/** 각 TF가 Function 조직에서 차출하는 인력 및 역량 감소 */
export const functionOrgPullByTF: Record<string, FunctionOrgPullItem[]> = {
  TF001: [
    { subJob: "PI",            pulledCount: 42, competencyDrop: 5 },
    { subJob: "Device",        pulledCount: 62, competencyDrop: 7 },
    { subJob: "FA",            pulledCount: 22, competencyDrop: 4 },
    { subJob: "Photo공정",     pulledCount: 30, competencyDrop: 6 },
    { subJob: "Etch공정",      pulledCount: 38, competencyDrop: 8 },
    { subJob: "Diffusion공정", pulledCount: 26, competencyDrop: 5 },
    { subJob: "ThinFilm공정",  pulledCount: 22, competencyDrop: 4 },
    { subJob: "C&C공정",       pulledCount: 10, competencyDrop: 3 },
  ],
  TF002: [
    { subJob: "PI",            pulledCount: 50, competencyDrop: 7 },
    { subJob: "Device",        pulledCount: 52, competencyDrop: 5 },
    { subJob: "FA",            pulledCount: 18, competencyDrop: 3 },
    { subJob: "Photo공정",     pulledCount: 40, competencyDrop: 9 },
    { subJob: "Etch공정",      pulledCount: 32, competencyDrop: 6 },
    { subJob: "Diffusion공정", pulledCount: 30, competencyDrop: 6 },
    { subJob: "ThinFilm공정",  pulledCount: 15, competencyDrop: 3 },
    { subJob: "C&C공정",       pulledCount: 8,  competencyDrop: 2 },
  ],
  TF003: [
    { subJob: "PI",            pulledCount: 34, competencyDrop: 4 },
    { subJob: "Device",        pulledCount: 48, competencyDrop: 5 },
    { subJob: "FA",            pulledCount: 20, competencyDrop: 3 },
    { subJob: "Photo공정",     pulledCount: 26, competencyDrop: 5 },
    { subJob: "Etch공정",      pulledCount: 34, competencyDrop: 7 },
    { subJob: "Diffusion공정", pulledCount: 22, competencyDrop: 4 },
    { subJob: "ThinFilm공정",  pulledCount: 16, competencyDrop: 3 },
    { subJob: "C&C공정",       pulledCount: 9,  competencyDrop: 2 },
  ],
  TF004: [
    { subJob: "PI",            pulledCount: 45, competencyDrop: 6 },
    { subJob: "Device",        pulledCount: 58, competencyDrop: 7 },
    { subJob: "FA",            pulledCount: 24, competencyDrop: 4 },
    { subJob: "Photo공정",     pulledCount: 32, competencyDrop: 7 },
    { subJob: "Etch공정",      pulledCount: 40, competencyDrop: 8 },
    { subJob: "Diffusion공정", pulledCount: 24, competencyDrop: 5 },
    { subJob: "ThinFilm공정",  pulledCount: 18, competencyDrop: 4 },
    { subJob: "C&C공정",       pulledCount: 11, competencyDrop: 3 },
  ],
  TF005: [
    { subJob: "PI",            pulledCount: 36, competencyDrop: 5 },
    { subJob: "Device",        pulledCount: 44, competencyDrop: 5 },
    { subJob: "FA",            pulledCount: 19, competencyDrop: 3 },
    { subJob: "Photo공정",     pulledCount: 28, competencyDrop: 5 },
    { subJob: "Etch공정",      pulledCount: 30, competencyDrop: 6 },
    { subJob: "Diffusion공정", pulledCount: 23, competencyDrop: 4 },
    { subJob: "ThinFilm공정",  pulledCount: 15, competencyDrop: 3 },
    { subJob: "C&C공정",       pulledCount: 8,  competencyDrop: 2 },
  ],
};

export interface FunctionOrgImpact extends FunctionOrgBaselineItem {
  pulledCount: number;
  remainingCount: number;
  competencyDrop: number;
  competencyAfter: number;
  shortage: number;              // max(0, minimumRequired - remainingCount)
  margin: number;                // remainingCount - minimumRequired (음수면 부족)
  riskLevel: FunctionRiskLevel;
}

/**
 * 특정 TF가 Function 조직에서 인력을 차출한 후의 영향을 계산.
 * 잔여 인력이 최소 기준 아래로 내려가거나 핵심 인력 역량 하락이 큰 경우 고/중위험으로 판정.
 */
function deriveCompetencyDrop(
  templateId: string,
  subJob: SubJob,
  pulledCount: number,
  originalCount: number
): number {
  if (pulledCount <= 0) return 0;

  const defaultPull = functionOrgPullByTF[templateId]?.find((item) => item.subJob === subJob);
  if (defaultPull && defaultPull.pulledCount > 0) {
    return Math.max(
      1,
      Math.min(15, Math.round(defaultPull.competencyDrop * (pulledCount / defaultPull.pulledCount)))
    );
  }

  return Math.max(1, Math.min(15, Math.round((pulledCount / Math.max(originalCount, 1)) * 20)));
}

export function computeFunctionOrgImpact(
  template: Pick<TFTemplate, "id" | "jobDistribution">
): FunctionOrgImpact[] {
  const pulls = new Map(template.jobDistribution.map((item) => [item.subJob, item.count]));

  return functionOrgBaseline.map((b) => {
    const pulledCount = pulls.get(b.subJob) ?? 0;
    const competencyDrop = deriveCompetencyDrop(template.id, b.subJob, pulledCount, b.originalCount);
    const remainingCount = Math.max(0, b.originalCount - pulledCount);
    const competencyAfter = Math.max(0, b.competencyBefore - competencyDrop);
    const shortage = Math.max(0, b.minimumRequired - remainingCount);
    const margin = remainingCount - b.minimumRequired;

    let riskLevel: FunctionRiskLevel = "low";
    if (margin < 0 || competencyDrop >= 7) riskLevel = "high";
    else if (margin <= 5 || competencyDrop >= 5) riskLevel = "medium";

    return {
      ...b,
      pulledCount,
      remainingCount,
      competencyDrop,
      competencyAfter,
      shortage,
      margin,
      riskLevel,
    };
  });
}
