// ── 조직 신설 인력 배치 - 데이터 정의 ─────────────────────────

export type OrgMiddleJob = '소자' | '공정';

export type OrgSubJob =
  | 'PI' | 'CA' | 'FA'
  | 'Photo공정' | 'Etch공정' | 'Diffusion공정' | 'ThinFilm공정' | 'C&C공정';

export interface DetailJob {
  id: string;
  name: string;
  subItems?: string[];   // 괄호 안 세부 항목 (e.g. ISO, BG)
  description: string;
  typicalCareerYears?: number;
}

export interface OrgSubJobDef {
  subJob: OrgSubJob;
  middleJob: OrgMiddleJob;
  icon: string;
  label: string;
  description: string;
  detailJobs: DetailJob[];
}

// ── 소자 ────────────────────────────────────────────────────

const PI_DETAIL_JOBS: DetailJob[] = [
  { id: 'pi_2d_ibg',   name: '2D_IBG',      subItems: ['ISO', 'BG'],          description: '2D Isolation Bit Gate 공정 개발 및 최적화',             typicalCareerYears: 5 },
  { id: 'pi_2d_sac',   name: '2D_SAC',      subItems: ['BLC', 'CBL', 'SNC'],  description: '2D Self-Aligned Contact 공정 개발',                      typicalCareerYears: 5 },
  { id: 'pi_2d_cap',   name: '2D_CAP',      subItems: ['SN'],                  description: '2D Storage Node Capacitor 공정 개발',                    typicalCareerYears: 5 },
  { id: 'pi_mlm',      name: 'MLM',                                             description: 'Multi-Level Metal 배선 공정 통합 및 최적화',              typicalCareerYears: 6 },
  { id: 'pi_bonding',  name: 'Bonding',                                         description: 'Pad Bonding 공정 개발 및 신뢰성 평가',                   typicalCareerYears: 4 },
  { id: 'pi_3d_wbl',   name: '3D_WBL',                                          description: '3D Word line / Bit Line 공정 개발',                      typicalCareerYears: 6 },
  { id: 'pi_3d_sn',    name: '3D_SN',                                           description: '3D Storage Node 공정 개발 및 수율 최적화',               typicalCareerYears: 6 },
  { id: 'pi_peri',     name: 'PERI_Planar',                                     description: '주변회로 평면 공정 개발 및 통합',                        typicalCareerYears: 5 },
];

const CA_DETAIL_JOBS: DetailJob[] = [
  { id: 'ca_transistor', name: 'Transistor',  description: 'Cell 트랜지스터 특성 설계 및 미세화 최적화',          typicalCareerYears: 6 },
  { id: 'ca_capacitor',  name: 'Capacitor',   description: '스토리지 캐패시터 용량 설계 및 최적화',              typicalCareerYears: 5 },
  { id: 'ca_bitline',    name: 'Bitline',      description: '비트라인 저항·캐패시턴스 최적화 및 센싱 마진 확보', typicalCareerYears: 5 },
  { id: 'ca_gidl',       name: 'GIDL_Ctrl',   description: 'GIDL 전류 제어 및 리프레시 특성 최적화',            typicalCareerYears: 5 },
  { id: 'ca_refresh',    name: 'Refresh',      description: '셀 리프레시 특성 분석 및 개선',                     typicalCareerYears: 4 },
  { id: 'ca_leakage',    name: 'Leakage',      description: '누설 전류 분석 및 제어 기술 개발',                  typicalCareerYears: 5 },
  { id: 'ca_spice',      name: 'SPICE',        description: 'SPICE 시뮬레이션 기반 셀 특성 예측 및 검증',        typicalCareerYears: 6 },
  { id: 'ca_cd',         name: 'CD_Optim',     description: 'Critical Dimension 공정 마진 최적화',               typicalCareerYears: 5 },
];

const FA_DETAIL_JOBS: DetailJob[] = [
  { id: 'fa_el',     name: 'FA_EL',      description: 'Electroluminescence 불량 위치 분석',               typicalCareerYears: 4 },
  { id: 'fa_tem',    name: 'TEM_분석',   description: 'Transmission Electron Microscopy 단면 분석',       typicalCareerYears: 5 },
  { id: 'fa_sem',    name: 'SEM_분석',   description: 'Scanning Electron Microscopy 표면·단면 분석',      typicalCareerYears: 4 },
  { id: 'fa_sims',   name: 'SIMS',       description: '이차이온 질량분석법을 통한 조성 심도 분석',         typicalCareerYears: 5 },
  { id: 'fa_xrf',    name: 'XRF',        description: 'X선 형광 분석을 통한 박막 성분 정량',              typicalCareerYears: 4 },
  { id: 'fa_htol',   name: 'HTOL',       description: '고온 동작 수명 신뢰성 시험 설계 및 평가',          typicalCareerYears: 5 },
  { id: 'fa_tddb',   name: 'TDDB',       description: '게이트 절연막 TDDB 분석 및 수명 예측',             typicalCareerYears: 5 },
  { id: 'fa_yield',  name: '수율분석',   description: '공정 수율 데이터 분석 및 불량 인자 규명',          typicalCareerYears: 4 },
];

// ── 공정 ────────────────────────────────────────────────────

const PHOTO_DETAIL_JOBS: DetailJob[] = [
  { id: 'photo_euv',     name: 'EUV_Litho',      description: 'EUV 리소그래피 공정 개발 및 최적화',               typicalCareerYears: 7 },
  { id: 'photo_arf',     name: 'ArF_Litho',       description: 'ArF 이머전 리소그래피 공정 개발',                  typicalCareerYears: 5 },
  { id: 'photo_opc',     name: 'OPC/RET',         description: 'Optical Proximity Correction 및 해상도 강화 기술', typicalCareerYears: 6 },
  { id: 'photo_cd',      name: 'CD_Metro',        description: 'Critical Dimension 계측·제어 및 불균일도 개선',    typicalCareerYears: 5 },
  { id: 'photo_resist',  name: 'Resist_Dev',      description: '레지스트 재료 평가 및 프로세스 최적화',            typicalCareerYears: 5 },
  { id: 'photo_mp',      name: 'MP_Scheme',       description: '멀티 패터닝 스킴 개발 및 수율 향상',               typicalCareerYears: 7 },
  { id: 'photo_inspect', name: 'Pattern_Inspect', description: '패턴 결함 검사 자동화 및 분석',                    typicalCareerYears: 4 },
  { id: 'photo_overlay', name: 'Overlay_Ctrl',    description: '오버레이 오차 분석 및 제어 시스템 개발',           typicalCareerYears: 5 },
];

const ETCH_DETAIL_JOBS: DetailJob[] = [
  { id: 'etch_har',      name: 'HAR_Etch',     description: 'High Aspect Ratio 심층 식각 공정 개발',        typicalCareerYears: 6 },
  { id: 'etch_poly',     name: 'Poly_Etch',    description: '폴리실리콘 게이트 식각 공정 개발',              typicalCareerYears: 5 },
  { id: 'etch_metal',    name: 'Metal_Etch',   description: '금속 배선 식각 공정 개발 및 선택비 확보',       typicalCareerYears: 5 },
  { id: 'etch_plasma',   name: 'Plasma_Dev',   description: '플라즈마 소스·바이어스 공정 최적화',            typicalCareerYears: 6 },
  { id: 'etch_ale',      name: 'ALE',          description: 'Atomic Layer Etching 단원자층 식각 기술 개발',  typicalCareerYears: 7 },
  { id: 'etch_select',   name: 'Selectivity',  description: '재료별 식각 선택비 제어 기술 개발',             typicalCareerYears: 5 },
  { id: 'etch_profile',  name: 'Profile_Ctrl', description: '식각 프로파일 수직성 및 균일도 제어',           typicalCareerYears: 5 },
  { id: 'etch_endpoint', name: 'Endpoint',     description: '식각 종점 검출 알고리즘 및 장비 개발',          typicalCareerYears: 4 },
];

const DIFF_DETAIL_JOBS: DetailJob[] = [
  { id: 'diff_ald',       name: 'ALD',          description: 'Atomic Layer Deposition 박막 공정 개발',           typicalCareerYears: 6 },
  { id: 'diff_cvd',       name: 'CVD',          description: 'Chemical Vapor Deposition 공정 개발·최적화',        typicalCareerYears: 5 },
  { id: 'diff_anneal',    name: 'Anneal',        description: '열처리 공정 최적화 및 활성화 기술',                typicalCareerYears: 5 },
  { id: 'diff_doping',    name: 'Doping',        description: '이온주입 및 도핑 농도 프로파일 제어',              typicalCareerYears: 5 },
  { id: 'diff_interface', name: 'Interface',     description: '게이트 절연막 계면 특성 최적화',                   typicalCareerYears: 6 },
  { id: 'diff_barrier',   name: 'Barrier',       description: '확산 배리어 금속 공정 개발',                       typicalCareerYears: 5 },
  { id: 'diff_lowk',      name: 'Low-K',         description: '저유전율 층간절연막 증착 공정 개발',               typicalCareerYears: 6 },
  { id: 'diff_silicide',  name: 'Silicide',      description: '실리사이드 형성 및 접촉저항 최적화',              typicalCareerYears: 5 },
];

const THINFILM_DETAIL_JOBS: DetailJob[] = [
  { id: 'tf_pvd',       name: 'PVD_Metal',   description: 'Physical Vapor Deposition 금속 박막 공정 개발',   typicalCareerYears: 5 },
  { id: 'tf_cmp',       name: 'CMP',          description: 'Chemical Mechanical Polishing 평탄화 공정 개발', typicalCareerYears: 5 },
  { id: 'tf_w',         name: 'W_Plug',       description: 'Tungsten 플러그 공정 개발 및 콘택 저항 최적화',   typicalCareerYears: 5 },
  { id: 'tf_barrier',   name: 'Barrier_TiN',  description: 'TiN/TaN 배리어 질화막 공정 개발',                typicalCareerYears: 5 },
  { id: 'tf_cu',        name: 'Cu_Process',   description: 'Cu 전기도금 및 어닐링 공정 개발',                 typicalCareerYears: 6 },
  { id: 'tf_contact',   name: 'Contact',      description: '오믹 콘택 형성 및 접촉저항 최적화',              typicalCareerYears: 5 },
  { id: 'tf_via',       name: 'Via_Process',  description: '층간 비아 형성 공정 개발 및 신뢰성 확보',         typicalCareerYears: 5 },
  { id: 'tf_damascene', name: 'Damascene',    description: '이중 다마신 금속 배선 공정 개발',                 typicalCareerYears: 6 },
];

const CC_DETAIL_JOBS: DetailJob[] = [
  { id: 'cc_feol',     name: 'FEOL_Clean',    description: 'Front-End 공정 세정 개발 및 파티클 제어',         typicalCareerYears: 4 },
  { id: 'cc_beol',     name: 'BEOL_Clean',    description: 'Back-End 금속 공정 세정 개발',                    typicalCareerYears: 4 },
  { id: 'cc_sc1sc2',   name: 'SC1/SC2',       description: 'RCA 계열 세정 공정 최적화',                       typicalCareerYears: 4 },
  { id: 'cc_hf',       name: 'HF_Clean',      description: 'HF 습식 세정 공정 개발 및 산화막 제어',           typicalCareerYears: 4 },
  { id: 'cc_particle', name: 'Particle_Ctrl', description: '파티클 오염원 분석 및 In-situ 제어 기술',         typicalCareerYears: 5 },
  { id: 'cc_surface',  name: 'Surface_Treat', description: '웨이퍼 표면 개질 및 소수성·친수성 제어',          typicalCareerYears: 4 },
  { id: 'cc_batch',    name: 'Batch_Clean',   description: '배치식 습식 세정 장비 공정 개발',                 typicalCareerYears: 3 },
  { id: 'cc_spray',    name: 'Spray_Clean',   description: '매엽식 스프레이 세정 공정 개발',                  typicalCareerYears: 3 },
];

// ── 전체 서브잡 정의 ────────────────────────────────────────

export const ORG_SUBJOB_DEFS: OrgSubJobDef[] = [
  /* 소자 */
  {
    subJob: 'PI', middleJob: '소자',
    icon: '⚡',
    label: 'PI (Process Integration)',
    description: '공정 통합 설계, Cell/PERI 플로우 및 수율 최적화',
    detailJobs: PI_DETAIL_JOBS,
  },
  {
    subJob: 'CA', middleJob: '소자',
    icon: '🔬',
    label: 'CA (Cell Architecture)',
    description: 'Cell 구조 설계, 트랜지스터·캐패시터·비트라인 특성 최적화',
    detailJobs: CA_DETAIL_JOBS,
  },
  {
    subJob: 'FA', middleJob: '소자',
    icon: '🔍',
    label: 'FA (Failure Analysis)',
    description: '불량 분석, 신뢰성 평가, 수율 저해 인자 규명',
    detailJobs: FA_DETAIL_JOBS,
  },
  /* 공정 */
  {
    subJob: 'Photo공정', middleJob: '공정',
    icon: '💡',
    label: 'Photo 공정',
    description: 'EUV/ArF 리소그래피 및 패터닝 공정 개발',
    detailJobs: PHOTO_DETAIL_JOBS,
  },
  {
    subJob: 'Etch공정', middleJob: '공정',
    icon: '⚙️',
    label: 'Etch 공정',
    description: '플라즈마 및 원자층 식각 공정 개발',
    detailJobs: ETCH_DETAIL_JOBS,
  },
  {
    subJob: 'Diffusion공정', middleJob: '공정',
    icon: '🌡️',
    label: 'Diffusion 공정',
    description: 'ALD/CVD 박막 증착 및 열처리 공정 개발',
    detailJobs: DIFF_DETAIL_JOBS,
  },
  {
    subJob: 'ThinFilm공정', middleJob: '공정',
    icon: '🪨',
    label: 'ThinFilm 공정',
    description: 'PVD/CMP 금속 박막 및 배선 공정 개발',
    detailJobs: THINFILM_DETAIL_JOBS,
  },
  {
    subJob: 'C&C공정', middleJob: '공정',
    icon: '🧹',
    label: 'C&C 공정 (Cleaning & Chemical)',
    description: '세정 공정 개발 및 표면 처리 기술',
    detailJobs: CC_DETAIL_JOBS,
  },
];

// ── helpers ────────────────────────────────────────────────

export function getSubJobDef(subJob: OrgSubJob): OrgSubJobDef | undefined {
  return ORG_SUBJOB_DEFS.find((d) => d.subJob === subJob);
}

export function getSubJobsByMiddle(middle: OrgMiddleJob): OrgSubJobDef[] {
  return ORG_SUBJOB_DEFS.filter((d) => d.middleJob === middle);
}

// ── 인력 요건 결과 타입 ─────────────────────────────────────

export interface DetailJobRequirement {
  detailJobId: string;
  detailJobName: string;
  subItems?: string[];
  description: string;
  headcount: number;
  targetScore: number;
}

export interface OrgSetupResult {
  middleJob: OrgMiddleJob;
  subJob: OrgSubJob;
  subJobLabel: string;
  requirements: DetailJobRequirement[];
  totalHeadcount: number;
  avgTargetScore: number;
}
