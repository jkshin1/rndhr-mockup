import {
  getMiddleJobBySubJob,
  type MiddleJob,
  type TFTemplate,
} from "./mockData";

export interface TFScenarioCompetencyRow {
  key: string;
  middleJob: MiddleJob;
  subJob: string;
  requiredSkills: string[];
  responsibility: string;
  minCareerYears: number;
  count: number;
  targetCount: number;
  targetScore: number;
  baselineActualScore: number;
  isCustom: boolean;
}

const DEFAULT_TARGET_SCORE = 74;
const DEFAULT_ACTUAL_SCORE = 62;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function buildRowKey(subJob: string, isCustom: boolean): string {
  return `${isCustom ? "custom" : "base"}:${subJob}`;
}

export function createTFScenarioRows(
  template: TFTemplate,
  seedRows?: TFScenarioCompetencyRow[]
): TFScenarioCompetencyRow[] {
  const seedMap = new Map(seedRows?.map((row) => [row.subJob, row]) ?? []);
  const baseRows = template.jobCompetencies.map((competency) => {
    const distribution = template.jobDistribution.find((item) => item.subJob === competency.subJob);
    const seed = seedMap.get(competency.subJob);

    return {
      key: buildRowKey(competency.subJob, false),
      middleJob: distribution?.middleJob ?? seed?.middleJob ?? getMiddleJobBySubJob(competency.subJob),
      subJob: competency.subJob,
      requiredSkills: competency.requiredSkills,
      responsibility: competency.responsibility,
      minCareerYears: competency.minCareerYears,
      count: seed?.count ?? distribution?.count ?? 0,
      targetCount: distribution?.targetCount ?? seed?.targetCount ?? 0,
      targetScore:
        template.targetCompetencyScores.find((item) => item.subJob === competency.subJob)?.score ??
        seed?.targetScore ??
        DEFAULT_TARGET_SCORE,
      baselineActualScore:
        template.competencyScores.find((item) => item.subJob === competency.subJob)?.score ??
        seed?.baselineActualScore ??
        DEFAULT_ACTUAL_SCORE,
      isCustom: false,
    };
  });

  const customRows = (seedRows ?? [])
    .filter((row) => row.isCustom && !baseRows.some((baseRow) => baseRow.subJob === row.subJob))
    .map((row) => ({
      ...row,
      key: buildRowKey(row.subJob, true),
      targetCount: Math.max(row.targetCount, row.count),
    }));

  return [...baseRows, ...customRows];
}

function deriveActualScore(baseTemplate: TFTemplate, row: TFScenarioCompetencyRow): number {
  if (row.count <= 0) return 0;

  if (row.isCustom) {
    const cap = Math.max(55, row.targetScore - 4);
    return clamp(Math.round(56 + Math.min(row.count, 10) * 2.2), 42, cap);
  }

  const baseDistribution = baseTemplate.jobDistribution.find((item) => item.subJob === row.subJob);
  const referenceCount = baseDistribution?.count ?? row.count;
  const targetCount = Math.max(row.targetCount, 1);
  const baseCoverage = Math.min(referenceCount / targetCount, 1.25);
  const scenarioCoverage = Math.min(row.count / targetCount, 1.25);
  const scoreDelta = Math.round((scenarioCoverage - baseCoverage) * 18);
  const maxScore = Math.max(row.targetScore, row.baselineActualScore);

  return clamp(row.baselineActualScore + scoreDelta, 35, maxScore);
}

export function buildScenarioTemplate(
  baseTemplate: TFTemplate,
  rows: TFScenarioCompetencyRow[]
): TFTemplate {
  const normalizedRows = rows
    .map((row) => ({
      ...row,
      subJob: row.subJob.trim(),
      count: Math.max(0, Math.round(row.count)),
      targetCount: Math.max(0, Math.round(row.targetCount)),
      minCareerYears: Math.max(0, Math.round(row.minCareerYears)),
      requiredSkills: row.requiredSkills.map((skill) => skill.trim()).filter(Boolean),
      responsibility: row.responsibility.trim(),
    }))
    .filter((row) => row.subJob.length > 0);

  return {
    ...baseTemplate,
    totalHeadcount: normalizedRows.reduce((sum, row) => sum + row.count, 0),
    jobDistribution: normalizedRows.map((row) => ({
      middleJob: row.middleJob,
      subJob: row.subJob,
      count: row.count,
      targetCount: row.isCustom ? Math.max(row.targetCount, row.count) : row.targetCount,
    })),
    jobCompetencies: normalizedRows.map((row) => ({
      subJob: row.subJob,
      requiredSkills: row.requiredSkills,
      responsibility: row.responsibility || `${row.subJob} 역량 기반 TF 수행`,
      minCareerYears: row.minCareerYears,
    })),
    targetCompetencyScores: normalizedRows.map((row) => ({
      subJob: row.subJob,
      score: row.targetScore,
    })),
    competencyScores: normalizedRows.map((row) => ({
      subJob: row.subJob,
      score: deriveActualScore(baseTemplate, row),
    })),
  };
}
