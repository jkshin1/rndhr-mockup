import {
  employees,
  functionOrgBaseline,
  getPlatformStageLabel,
  getMiddleJobBySubJob,
  getOrderedTfSubJobs,
  getTemplateSpecialFactors,
  type Employee,
  type FunctionMiddle,
  type FunctionRiskLevel,
  type MiddleJob,
  type PlatformStage,
  type TFTemplate,
} from './mockData';

const CURRENT_YEAR = 2026;

type CareerRiskLevel = 'high' | 'medium' | 'low';
type CareerAction = '경력직 보강' | 'Tech TF 경험자 우선 차출' | '리더 경력 보강' | '현 수준 유지';
type CareerRoleTitle = '팀원' | 'Module장' | 'Part장' | '팀장';
export type CareerLevel = 'CL2' | 'CL3' | 'CL4' | 'CL5';

interface CareerCatalog {
  organizations: string[];
  unitJobs: string[];
  detailJobs: string[];
  adjacentSubJobs: string[];
}

export interface EmployeeCareerHistoryEntry {
  year: number;
  organization: string;
  techTfExperience: boolean;
  roleTitle: CareerRoleTitle;
  middleJob: MiddleJob;
  subJob: string;
  unitJob: string;
  detailJob: string;
}

interface EmployeeCareerProfile {
  employee: Employee;
  history: EmployeeCareerHistoryEntry[];
  careerLevel: CareerLevel;
  experiencedSubJobs: Set<string>;
  techTfYears: number;
  recentTechTfYears: number;
  latestTechTfYear: number | null;
  moduleLeadYears: number;
  partLeadYears: number;
  teamLeadYears: number;
  leadershipYears: number;
  weightedCareerYears: number;
  hasTechTfExperience: boolean;
  hasLeadershipExperience: boolean;
  currentOrganization: string;
}

export interface TFCareerMetric {
  subJob: string;
  middleJob: MiddleJob;
  currentCount: number;
  targetCount: number;
  recommendedMinCareerYears: number;
  requiredAvgCareerYears: number;
  actualAvgCareerYears: number;
  baseAvgCareerYears: number;
  platformAdjustmentYears: number;
  nuddAdjustmentYears: number;
  specialAdjustmentYears: number;
  careerGap: number;
  techTfExperiencedRate: number;
  requiredTechTfExperiencedRate: number;
  additionalTechTfRequiredRate: number;
  techTfRateGap: number;
  leadershipExperiencedCount: number;
  requiredLeadershipCount: number;
  additionalLeadershipCount: number;
  teamLeadExperiencedCount: number;
  partLeadExperiencedCount: number;
  moduleLeadExperiencedCount: number;
  sampleSize: number;
  sampleEmployees: string[];
  riskLevel: CareerRiskLevel;
  actions: CareerAction[];
}

export interface FunctionOrgCareerImpact {
  subJob: string;
  functionMiddle: FunctionMiddle;
  originalCount: number;
  minimumRequired: number;
  avgCareerBefore: number;
  pulledCount: number;
  remainingCount: number;
  careerDrop: number;
  avgCareerAfter: number;
  shortage: number;
  margin: number;
  riskLevel: FunctionRiskLevel;
}

export interface CareerDistributionMetric {
  subJob: string;
  middleJob: MiddleJob;
  currentCount: number;
  sampleSize: number;
  clCounts: Record<CareerLevel, number>;
  clRatios: Record<CareerLevel, number>;
  dominantLevel: CareerLevel;
  actualAvgCareerYears: number;
}

export interface TechTfDepthMetric {
  subJob: string;
  middleJob: MiddleJob;
  currentCount: number;
  sampleSize: number;
  experiencedRate: number;
  averageTechTfYears: number;
  recentExperiencedRate: number;
  deepExperiencedCount: number;
  leaderWithTechTfCount: number;
  latestParticipationYear: number | null;
  sampleEmployees: string[];
}

export interface TFSpecialContextImpact {
  subJob: string;
  middleJob: MiddleJob;
  platformAdjustmentYears: number;
  nuddAdjustmentYears: number;
  totalAdjustmentYears: number;
  additionalTechTfRate: number;
  additionalLeadershipCount: number;
}

export interface TFSpecialContextSummary {
  platformSeries: string;
  platformStage: PlatformStage;
  platformStageLabel: string;
  platformContextLabel?: string;
  platformKeyFocus?: string;
  platformUndecided: boolean;
  isNewPlatformIntroduction: boolean;
  nuddRatio: number;
  nuddLevel: CareerRiskLevel;
  averageAdditionalCareerYears: number;
  maxAdditionalCareerYears: number;
  averageAdditionalTechTfRate: number;
  leadershipPremiumJobs: number;
  impactedJobs: TFSpecialContextImpact[];
}

interface SubJobCareerSample {
  subJob: string;
  middleJob: MiddleJob;
  currentCount: number;
  targetCount: number;
  recommendedMinCareerYears: number;
  sample: EmployeeCareerProfile[];
}

interface SpecialRequirementAdjustment {
  platformAdjustmentYears: number;
  nuddAdjustmentYears: number;
  totalAdjustmentYears: number;
  additionalTechTfRate: number;
  additionalLeadershipCount: number;
}

const CAREER_CATALOGS: Record<string, CareerCatalog> = {
  PI: {
    organizations: ['선행 PI랩', '제품기술 PI팀', '양산 PI팀'],
    unitJobs: ['공정 통합', '제품 통합', '수율 개선'],
    detailJobs: ['통합 플로우 설계', 'Lot 운영 최적화', '수율 저해 인자 해소'],
    adjacentSubJobs: ['Device', 'FA'],
  },
  Device: {
    organizations: ['디바이스 설계팀', '셀 특성 평가팀', '제품 설계팀'],
    unitJobs: ['셀 구조 설계', '전기 특성', '회로 검증'],
    detailJobs: ['셀 구조 최적화', '전기적 특성 분석', '설계 검증'],
    adjacentSubJobs: ['PI', 'FA'],
  },
  FA: {
    organizations: ['불량분석센터', '신뢰성 평가팀', '수율 분석팀'],
    unitJobs: ['결함 분석', '신뢰성', '수율 분석'],
    detailJobs: ['SEM/TEM 분석', '가속 시험', '수율 저해 인자 분석'],
    adjacentSubJobs: ['Device', 'PI'],
  },
  Photo공정: {
    organizations: ['Photo 개발팀', 'Pattern 공정팀', '리소그래피 개선팀'],
    unitJobs: ['EUV 패터닝', '오버레이', 'CD 관리'],
    detailJobs: ['EUV 패터닝 최적화', 'Overlay 안정화', 'CD 편차 개선'],
    adjacentSubJobs: ['Etch공정', 'C&C공정'],
  },
  Etch공정: {
    organizations: ['Etch 개발팀', '플라즈마 공정팀', 'HAR 식각팀'],
    unitJobs: ['식각 프로파일', '선택비', '플라즈마 진단'],
    detailJobs: ['HAR 식각 최적화', '식각 선택비 제어', '식각 균일도 안정화'],
    adjacentSubJobs: ['Photo공정', 'Diffusion공정'],
  },
  Diffusion공정: {
    organizations: ['박막/확산팀', 'ALD/CVD팀', '열처리 공정팀'],
    unitJobs: ['증착', '열처리', '계면 제어'],
    detailJobs: ['ALD 증착 최적화', '열처리 조건 설계', '계면 결함 저감'],
    adjacentSubJobs: ['Etch공정', 'ThinFilm공정'],
  },
  ThinFilm공정: {
    organizations: ['금속배선팀', 'CMP 공정팀', '후공정 박막팀'],
    unitJobs: ['금속화', 'CMP', '배선 신뢰성'],
    detailJobs: ['금속 배선 형성', '평탄화 최적화', '배선 저항 저감'],
    adjacentSubJobs: ['Diffusion공정', 'C&C공정'],
  },
  'C&C공정': {
    organizations: ['세정공정팀', '표면처리팀', '오염제어팀'],
    unitJobs: ['세정', '표면 개질', '오염 제어'],
    detailJobs: ['세정 레시피 최적화', '표면 활성화', '파티클 제어'],
    adjacentSubJobs: ['Photo공정', 'ThinFilm공정'],
  },
};

const PLATFORM_WEIGHT_BY_SUBJOB: Record<string, number> = {
  PI: 1.05,
  Device: 0.9,
  FA: 0.78,
  Photo공정: 1.12,
  Etch공정: 1.18,
  Diffusion공정: 1.0,
  ThinFilm공정: 0.94,
  'C&C공정': 0.7,
};

const NUDD_WEIGHT_BY_SUBJOB: Record<string, number> = {
  PI: 1.12,
  Device: 1.16,
  FA: 1.0,
  Photo공정: 0.82,
  Etch공정: 0.86,
  Diffusion공정: 0.78,
  ThinFilm공정: 0.95,
  'C&C공정': 0.66,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getPlatformBaseCareerPremium(platformStage: PlatformStage): number {
  if (platformStage === 1) return 1.4;
  if (platformStage === 2) return 0.7;
  return 0.25;
}

function getPlatformBaseTechTfPremium(platformStage: PlatformStage): number {
  if (platformStage === 1) return 0.1;
  if (platformStage === 2) return 0.05;
  return 0.02;
}

function createEmptyClDistribution(): Record<CareerLevel, number> {
  return { CL2: 0, CL3: 0, CL4: 0, CL5: 0 };
}

function getEmployeeNumber(employeeId: string): number {
  return Number(employeeId.replace(/\D/g, '')) || 0;
}

function getCareerCatalog(subJob: string): CareerCatalog {
  return CAREER_CATALOGS[subJob] ?? {
    organizations: ['선행기술 TF', '제품개발 TF', '양산개선 TF'],
    unitJobs: ['직무 운영', '기술 검증', '프로젝트 지원'],
    detailJobs: [`${subJob} 기획`, `${subJob} 검증`, `${subJob} 실행`],
    adjacentSubJobs: [],
  };
}

function getCareerLevelFromEmployee(employee: Employee): CareerLevel {
  if (employee.position.includes('수석')) return 'CL5';
  if (employee.position.includes('책임')) return 'CL4';
  if (employee.position.includes('선임')) return 'CL3';
  return 'CL2';
}

function getRoleTitle(employee: Employee, yearOffset: number, totalYears: number): CareerRoleTitle {
  const progress = yearOffset + 1;
  const senior = employee.position.includes('수석');
  const principal = employee.position.includes('책임');

  if (senior && progress >= totalYears - 1) return '팀장';
  if ((senior || principal) && progress >= totalYears - 3) return 'Part장';
  if (progress >= totalYears - 2 && totalYears >= 7) return 'Module장';
  return '팀원';
}

function buildCareerHistory(employee: Employee): EmployeeCareerHistoryEntry[] {
  const employeeNo = getEmployeeNumber(employee.id);
  const catalog = getCareerCatalog(employee.subJob);
  const tfYears = employeeNo % 4 === 0
    ? 0
    : clamp(Math.round(employee.careerYears * 0.28) + (employeeNo % 3), 1, Math.min(employee.careerYears, 6));
  const tfStartIndex = Math.max(0, employee.careerYears - tfYears);

  return Array.from({ length: employee.careerYears }, (_, index) => {
    const year = CURRENT_YEAR - employee.careerYears + index + 1;
    const historicalSubJob =
      index < 2 && catalog.adjacentSubJobs.length > 0 && employee.careerYears >= 8
        ? catalog.adjacentSubJobs[employeeNo % catalog.adjacentSubJobs.length]
        : employee.subJob;
    const historicalCatalog = getCareerCatalog(historicalSubJob);

    return {
      year,
      organization:
        historicalCatalog.organizations[
          Math.min(
            historicalCatalog.organizations.length - 1,
            Math.floor((index / Math.max(employee.careerYears - 1, 1)) * historicalCatalog.organizations.length)
          )
        ],
      techTfExperience: index >= tfStartIndex,
      roleTitle: getRoleTitle(employee, index, employee.careerYears),
      middleJob: getMiddleJobBySubJob(historicalSubJob, employee.middleJob),
      subJob: historicalSubJob,
      unitJob: historicalCatalog.unitJobs[index % historicalCatalog.unitJobs.length],
      detailJob: historicalCatalog.detailJobs[index % historicalCatalog.detailJobs.length],
    };
  });
}

function buildEmployeeCareerProfile(employee: Employee): EmployeeCareerProfile {
  const history = buildCareerHistory(employee);
  const techTfHistory = history.filter((entry) => entry.techTfExperience);
  const techTfYears = history.filter((entry) => entry.techTfExperience).length;
  const recentTechTfYears = techTfHistory.filter((entry) => entry.year >= CURRENT_YEAR - 2).length;
  const latestTechTfYear = techTfHistory.length > 0 ? techTfHistory[techTfHistory.length - 1].year : null;
  const moduleLeadYears = history.filter((entry) => entry.roleTitle === 'Module장').length;
  const partLeadYears = history.filter((entry) => entry.roleTitle === 'Part장').length;
  const teamLeadYears = history.filter((entry) => entry.roleTitle === '팀장').length;
  const leadershipYears = moduleLeadYears + partLeadYears + teamLeadYears;
  const weightedCareerYears =
    employee.careerYears +
    techTfYears * 0.45 +
    moduleLeadYears * 0.2 +
    partLeadYears * 0.35 +
    teamLeadYears * 0.55;

  return {
    employee,
    history,
    careerLevel: getCareerLevelFromEmployee(employee),
    experiencedSubJobs: new Set(history.map((entry) => entry.subJob)),
    techTfYears,
    recentTechTfYears,
    latestTechTfYear,
    moduleLeadYears,
    partLeadYears,
    teamLeadYears,
    leadershipYears,
    weightedCareerYears,
    hasTechTfExperience: techTfYears > 0,
    hasLeadershipExperience: leadershipYears > 0,
    currentOrganization: history[history.length - 1]?.organization ?? employee.department,
  };
}

const EMPLOYEE_CAREER_PROFILES = employees.map(buildEmployeeCareerProfile);

function getRelevantProfiles(subJob: string, middleJob: MiddleJob): EmployeeCareerProfile[] {
  const exact = EMPLOYEE_CAREER_PROFILES.filter(
    (profile) =>
      profile.employee.subJob === subJob || profile.experiencedSubJobs.has(subJob)
  );
  const sameMiddle = EMPLOYEE_CAREER_PROFILES.filter(
    (profile) => profile.employee.middleJob === middleJob
  );

  const merged: EmployeeCareerProfile[] = [];
  const seen = new Set<string>();
  [...exact, ...sameMiddle, ...EMPLOYEE_CAREER_PROFILES].forEach((profile) => {
    if (seen.has(profile.employee.id)) return;
    seen.add(profile.employee.id);
    merged.push(profile);
  });

  return merged.sort((a, b) => {
    const aFit =
      (a.employee.subJob === subJob ? 25 : a.experiencedSubJobs.has(subJob) ? 14 : 0) +
      a.weightedCareerYears * 2 +
      a.techTfYears * 1.6 +
      a.leadershipYears * 1.4;
    const bFit =
      (b.employee.subJob === subJob ? 25 : b.experiencedSubJobs.has(subJob) ? 14 : 0) +
      b.weightedCareerYears * 2 +
      b.techTfYears * 1.6 +
      b.leadershipYears * 1.4;

    return bFit - aFit;
  });
}

function getRequiredLeadershipCount(targetCount: number): number {
  if (targetCount >= 70) return 3;
  if (targetCount >= 35) return 2;
  return 1;
}

function getRequiredTechTfRate(targetCount: number): number {
  if (targetCount >= 70) return 0.55;
  if (targetCount >= 40) return 0.45;
  if (targetCount >= 20) return 0.35;
  return 0.25;
}

function getRequiredAvgCareerYears(minCareerYears: number, targetCount: number): number {
  if (targetCount >= 70) return minCareerYears + 2.2;
  if (targetCount >= 40) return minCareerYears + 1.5;
  if (targetCount >= 20) return minCareerYears + 1.0;
  return minCareerYears + 0.6;
}

function getSpecialRequirementAdjustment(
  template: TFTemplate,
  subJob: string,
  middleJob: MiddleJob,
  targetCount: number
): SpecialRequirementAdjustment {
  const factors = getTemplateSpecialFactors(template);
  const platformWeight =
    PLATFORM_WEIGHT_BY_SUBJOB[subJob] ?? (middleJob === '공정' ? 1.0 : 0.9);
  const nuddWeight =
    NUDD_WEIGHT_BY_SUBJOB[subJob] ?? (middleJob === '소자' ? 1.02 : 0.82);
  const platformAdjustmentYears = round1(
    getPlatformBaseCareerPremium(factors.platformStage) * platformWeight
  );
  const nuddAdjustmentYears = round1(factors.nuddRatio * 2.2 * nuddWeight);
  const additionalTechTfRate =
    getPlatformBaseTechTfPremium(factors.platformStage) * Math.min(platformWeight, 1.15) +
    factors.nuddRatio * 0.12 * Math.min(nuddWeight, 1.18);
  const additionalLeadershipCount =
    (factors.platformStage === 1 && targetCount >= 30 ? 1 : 0) +
    (factors.nuddRatio >= 0.4 && ['PI', 'Device', 'FA'].includes(subJob) && targetCount >= 20 ? 1 : 0);

  return {
    platformAdjustmentYears,
    nuddAdjustmentYears,
    totalAdjustmentYears: round1(platformAdjustmentYears + nuddAdjustmentYears),
    additionalTechTfRate,
    additionalLeadershipCount,
  };
}

function computeCareerRisk(
  careerGap: number,
  techTfRateGap: number,
  leadershipShortage: number
): { riskLevel: CareerRiskLevel; actions: CareerAction[] } {
  const actions: CareerAction[] = [];

  if (careerGap >= 1.5) actions.push('경력직 보강');
  if (techTfRateGap >= 0.12) actions.push('Tech TF 경험자 우선 차출');
  if (leadershipShortage > 0) actions.push('리더 경력 보강');
  if (actions.length === 0) actions.push('현 수준 유지');

  const riskLevel: CareerRiskLevel =
    careerGap >= 2.5 || (techTfRateGap >= 0.18 && leadershipShortage > 0)
      ? 'high'
      : careerGap >= 1.2 || techTfRateGap >= 0.08 || leadershipShortage > 0
      ? 'medium'
      : 'low';

  return { riskLevel, actions };
}

function buildSubJobCareerSamples(template: TFTemplate): SubJobCareerSample[] {
  return getOrderedTfSubJobs(template).map((subJob) => {
    const distribution = template.jobDistribution.find((item) => item.subJob === subJob);
    const competency = template.jobCompetencies.find((item) => item.subJob === subJob);
    const middleJob = distribution?.middleJob ?? getMiddleJobBySubJob(subJob);
    const profiles = getRelevantProfiles(subJob, middleJob);
    const sampleSize = Math.min(
      profiles.length,
      Math.max(3, Math.min(6, Math.ceil((distribution?.count ?? 3) / 15)))
    );
    return {
      subJob,
      middleJob,
      currentCount: distribution?.count ?? 0,
      targetCount: distribution?.targetCount ?? distribution?.count ?? sampleSize,
      recommendedMinCareerYears: competency?.minCareerYears ?? 4,
      sample: profiles.slice(0, sampleSize),
    };
  });
}

export function analyzeTemplateCareer(template: TFTemplate): TFCareerMetric[] {
  return buildSubJobCareerSamples(template).map((item) => {
    const { subJob, middleJob, currentCount, targetCount, recommendedMinCareerYears, sample } = item;

    const sampleSize = sample.length;
    const baseAvgCareerYears = round1(average(sample.map((profile) => profile.employee.careerYears)));
    const actualAvgCareerYears = round1(average(sample.map((profile) => profile.weightedCareerYears)));
    const techTfExperiencedRate = average(
      sample.map((profile) => (profile.hasTechTfExperience ? 1 : 0))
    );
    const leadershipExperiencedCount = sample.filter(
      (profile) => profile.hasLeadershipExperience
    ).length;
    const teamLeadExperiencedCount = sample.filter((profile) => profile.teamLeadYears > 0).length;
    const partLeadExperiencedCount = sample.filter((profile) => profile.partLeadYears > 0).length;
    const moduleLeadExperiencedCount = sample.filter((profile) => profile.moduleLeadYears > 0).length;
    const specialAdjustment = getSpecialRequirementAdjustment(
      template,
      subJob,
      middleJob,
      targetCount
    );

    const requiredAvgCareerYears = round1(
      getRequiredAvgCareerYears(recommendedMinCareerYears, targetCount) +
      specialAdjustment.totalAdjustmentYears
    );
    const requiredTechTfExperiencedRate = clamp(
      getRequiredTechTfRate(targetCount) + specialAdjustment.additionalTechTfRate,
      0.2,
      0.9
    );
    const requiredLeadershipCount =
      getRequiredLeadershipCount(targetCount) + specialAdjustment.additionalLeadershipCount;
    const careerGap = round1(Math.max(0, requiredAvgCareerYears - actualAvgCareerYears));
    const techTfRateGap = Math.max(
      0,
      round1(requiredTechTfExperiencedRate - techTfExperiencedRate)
    );
    const leadershipShortage = Math.max(0, requiredLeadershipCount - leadershipExperiencedCount);
    const { riskLevel, actions } = computeCareerRisk(
      careerGap,
      techTfRateGap,
      leadershipShortage
    );

    return {
      subJob,
      middleJob,
      currentCount,
      targetCount,
      recommendedMinCareerYears,
      requiredAvgCareerYears,
      actualAvgCareerYears,
      baseAvgCareerYears,
      platformAdjustmentYears: specialAdjustment.platformAdjustmentYears,
      nuddAdjustmentYears: specialAdjustment.nuddAdjustmentYears,
      specialAdjustmentYears: specialAdjustment.totalAdjustmentYears,
      careerGap,
      techTfExperiencedRate,
      requiredTechTfExperiencedRate,
      additionalTechTfRequiredRate: specialAdjustment.additionalTechTfRate,
      techTfRateGap,
      leadershipExperiencedCount,
      requiredLeadershipCount,
      additionalLeadershipCount: specialAdjustment.additionalLeadershipCount,
      teamLeadExperiencedCount,
      partLeadExperiencedCount,
      moduleLeadExperiencedCount,
      sampleSize,
      sampleEmployees: sample.map((profile) => profile.employee.name),
      riskLevel,
      actions,
    };
  });
}

export function analyzeCareerDistribution(template: TFTemplate): CareerDistributionMetric[] {
  return buildSubJobCareerSamples(template).map((item) => {
    const clCounts = createEmptyClDistribution();
    item.sample.forEach((profile) => {
      clCounts[profile.careerLevel] += 1;
    });

    const sampleSize = item.sample.length;
    const clRatios = {
      CL2: sampleSize > 0 ? clCounts.CL2 / sampleSize : 0,
      CL3: sampleSize > 0 ? clCounts.CL3 / sampleSize : 0,
      CL4: sampleSize > 0 ? clCounts.CL4 / sampleSize : 0,
      CL5: sampleSize > 0 ? clCounts.CL5 / sampleSize : 0,
    };
    const dominantLevel = (Object.entries(clCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'CL3') as CareerLevel;

    return {
      subJob: item.subJob,
      middleJob: item.middleJob,
      currentCount: item.currentCount,
      sampleSize,
      clCounts,
      clRatios,
      dominantLevel,
      actualAvgCareerYears: round1(average(item.sample.map((profile) => profile.weightedCareerYears))),
    };
  });
}

export function analyzeTechTfDepth(template: TFTemplate): TechTfDepthMetric[] {
  return buildSubJobCareerSamples(template).map((item) => {
    const sample = item.sample;
    const sampleSize = sample.length;
    const experiencedCount = sample.filter((profile) => profile.hasTechTfExperience).length;
    const recentExperiencedCount = sample.filter((profile) => profile.recentTechTfYears > 0).length;
    const deepExperiencedCount = sample.filter((profile) => profile.techTfYears >= 3).length;
    const leaderWithTechTfCount = sample.filter(
      (profile) => profile.hasTechTfExperience && profile.hasLeadershipExperience
    ).length;
    const latestParticipationYear = sample
      .map((profile) => profile.latestTechTfYear)
      .filter((year): year is number => year !== null)
      .sort((a, b) => b - a)[0] ?? null;

    return {
      subJob: item.subJob,
      middleJob: item.middleJob,
      currentCount: item.currentCount,
      sampleSize,
      experiencedRate: sampleSize > 0 ? experiencedCount / sampleSize : 0,
      averageTechTfYears: round1(average(sample.map((profile) => profile.techTfYears))),
      recentExperiencedRate: sampleSize > 0 ? recentExperiencedCount / sampleSize : 0,
      deepExperiencedCount,
      leaderWithTechTfCount,
      latestParticipationYear,
      sampleEmployees: sample.map((profile) => profile.employee.name),
    };
  });
}

export function analyzeTemplateSpecialContext(template: TFTemplate): TFSpecialContextSummary {
  const factors = getTemplateSpecialFactors(template);
  const impactedJobs = buildSubJobCareerSamples(template)
    .map((item) => {
      const adjustment = getSpecialRequirementAdjustment(
        template,
        item.subJob,
        item.middleJob,
        item.targetCount
      );

      return {
        subJob: item.subJob,
        middleJob: item.middleJob,
        platformAdjustmentYears: adjustment.platformAdjustmentYears,
        nuddAdjustmentYears: adjustment.nuddAdjustmentYears,
        totalAdjustmentYears: adjustment.totalAdjustmentYears,
        additionalTechTfRate: adjustment.additionalTechTfRate,
        additionalLeadershipCount: adjustment.additionalLeadershipCount,
      };
    })
    .sort((a, b) => {
      const aScore = a.totalAdjustmentYears + a.additionalTechTfRate * 10 + a.additionalLeadershipCount * 0.4;
      const bScore = b.totalAdjustmentYears + b.additionalTechTfRate * 10 + b.additionalLeadershipCount * 0.4;
      return bScore - aScore;
    });

  const nuddLevel: CareerRiskLevel =
    factors.nuddRatio >= 0.4 ? 'high' : factors.nuddRatio >= 0.25 ? 'medium' : 'low';

  return {
    platformSeries: factors.platformSeries,
    platformStage: factors.platformStage,
    platformStageLabel: getPlatformStageLabel(factors.platformStage),
    platformContextLabel: factors.platformContextLabel,
    platformKeyFocus: factors.platformKeyFocus,
    platformUndecided: factors.platformUndecided ?? false,
    isNewPlatformIntroduction: factors.platformStage === 1,
    nuddRatio: factors.nuddRatio,
    nuddLevel,
    averageAdditionalCareerYears: round1(average(impactedJobs.map((item) => item.totalAdjustmentYears))),
    maxAdditionalCareerYears: round1(
      Math.max(...impactedJobs.map((item) => item.totalAdjustmentYears), 0)
    ),
    averageAdditionalTechTfRate: average(impactedJobs.map((item) => item.additionalTechTfRate)),
    leadershipPremiumJobs: impactedJobs.filter((item) => item.additionalLeadershipCount > 0).length,
    impactedJobs: impactedJobs.slice(0, 5),
  };
}

export function computeFunctionOrgCareerImpact(template: TFTemplate): FunctionOrgCareerImpact[] {
  const careerMetrics = analyzeTemplateCareer(template);
  const metricMap = new Map(careerMetrics.map((metric) => [metric.subJob, metric]));

  return functionOrgBaseline.map((baseline) => {
    const pulledCount =
      template.jobDistribution.find((item) => item.subJob === baseline.subJob)?.count ?? 0;
    const metric = metricMap.get(baseline.subJob);
    const avgCareerBefore = round1(
      Math.max(metric?.actualAvgCareerYears ?? metric?.requiredAvgCareerYears ?? 8, 6) + 0.8
    );
    const leadershipPressure =
      metric && metric.requiredLeadershipCount > 0
        ? metric.requiredLeadershipCount / Math.max(metric.sampleSize, 1)
        : 0.15;
    const specialPressure = metric
      ? metric.specialAdjustmentYears * 0.14 + metric.additionalLeadershipCount * 0.18
      : 0.12;
    const careerDrop = round1(
      Math.min(
        3.2,
        (pulledCount / Math.max(baseline.originalCount, 1)) *
          (4.2 + leadershipPressure * 2 + specialPressure)
      )
    );
    const remainingCount = Math.max(0, baseline.originalCount - pulledCount);
    const avgCareerAfter = round1(Math.max(0, avgCareerBefore - careerDrop));
    const shortage = Math.max(0, baseline.minimumRequired - remainingCount);
    const margin = remainingCount - baseline.minimumRequired;

    let riskLevel: FunctionRiskLevel = 'low';
    if (margin < 0 || careerDrop >= 1.8) riskLevel = 'high';
    else if (margin <= 5 || careerDrop >= 1.0) riskLevel = 'medium';

    return {
      subJob: baseline.subJob,
      functionMiddle: baseline.functionMiddle,
      originalCount: baseline.originalCount,
      minimumRequired: baseline.minimumRequired,
      avgCareerBefore,
      pulledCount,
      remainingCount,
      careerDrop,
      avgCareerAfter,
      shortage,
      margin,
      riskLevel,
    };
  });
}
