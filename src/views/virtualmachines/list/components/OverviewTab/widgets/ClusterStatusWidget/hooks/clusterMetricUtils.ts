import { PrometheusResult } from '@openshift-console/dynamic-plugin-sdk';

import { ScoreStatus } from '../../shared/StatusScoreList/StatusScoreList';

import {
  INSTANCE_TO_NODE,
  SEVERITY_HIGH,
  SEVERITY_LOW,
  SEVERITY_MEDIUM,
  SEVERITY_ORDER,
  SEVERITY_STATUS_MAP,
  SeverityCount,
  SeverityLevel,
  THRESHOLD_HIGH,
  THRESHOLD_MEDIUM,
} from './clusterMetricConstants';

/**
 * Returns the severity level for a value where higher = worse (e.g. utilization).
 */
const getLevelAscending = (value: number): SeverityLevel => {
  if (value >= THRESHOLD_HIGH) return SEVERITY_HIGH;
  if (value >= THRESHOLD_MEDIUM) return SEVERITY_MEDIUM;
  return SEVERITY_LOW;
};

/**
 * Returns the status color for a value where higher = worse (e.g. utilization).
 * Derives status from the severity level via SEVERITY_STATUS_MAP.
 */
export const getStatusAscending = (value: number): ScoreStatus =>
  SEVERITY_STATUS_MAP[getLevelAscending(value)];

/**
 * Returns the severity level for a value where higher = better (e.g. balance score).
 */
export const getLevelDescending = (value: number): SeverityLevel => {
  if (value >= THRESHOLD_HIGH) return SEVERITY_HIGH;
  if (value >= THRESHOLD_MEDIUM) return SEVERITY_MEDIUM;
  return SEVERITY_LOW;
};

/**
 * Returns the status color for a value where higher = better (e.g. balance score).
 * Derives status from the severity level via SEVERITY_STATUS_MAP.
 */
export const getStatusDescending = (value: number): ScoreStatus =>
  SEVERITY_STATUS_MAP[getLevelDescending(value)];

/**
 * Counts values by severity level and returns an array of SeverityCount objects.
 * Use ascending for metrics where higher = worse (e.g. utilization).
 * Use descending for metrics where higher = better (e.g. balance score).
 */
export const buildSeverityCounts = (
  values: number[],
  direction: 'ascending' | 'descending',
): SeverityCount[] => {
  const getLevelFn = direction === 'ascending' ? getLevelAscending : getLevelDescending;
  const counts: Record<SeverityLevel, number> = {
    [SEVERITY_HIGH]: 0,
    [SEVERITY_LOW]: 0,
    [SEVERITY_MEDIUM]: 0,
  };

  for (const v of values) {
    counts[getLevelFn(v)]++;
  }

  return SEVERITY_ORDER.map((level) => ({
    count: counts[level],
    level,
    status: SEVERITY_STATUS_MAP[level],
  }));
};

export const wrapLabelReplace = (expr: string): string => INSTANCE_TO_NODE.replace('%EXPR%', expr);

const toFiniteNumber = (value: number | string | undefined): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Builds a map from a Prometheus label to its numeric value.
 * Defaults to extracting the `node` label.
 */
export const buildLabelMap = (
  results: PrometheusResult[],
  labelKey = 'node',
): Record<string, number> => {
  const map: Record<string, number> = {};
  for (const r of results) {
    const key = r.metric?.[labelKey];
    if (key) map[key] = toFiniteNumber(r.value?.[1]);
  }
  return map;
};

/** Coefficient-of-variation based distribution score (0 = unbalanced, 100 = perfectly even). */
export const computeDistributionScore = (values: number[]): number => {
  if (values.length === 0) return 100;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 100;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const coefficientOfVariation = Math.sqrt(variance) / mean;
  return Math.max(0, Math.round(100 - coefficientOfVariation * 100));
};

export const pct = (used: number, total: number): number => (total > 0 ? (used / total) * 100 : 0);

export const formatPercent = (value: number): string => `${Math.round(value)}%`;

const escapeLabelValue = (v: string): string => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

/**
 * Injects a `cluster="name"` label filter into every metric selector in a PromQL expression.
 * Handles bare metrics (`metric_name` → `metric_name{cluster="X"}`) and metrics with
 * existing labels (`metric_name{a="b"}` → `metric_name{cluster="X",a="b"}`).
 */
export const injectClusterFilter = (expr: string, cluster: string): string => {
  if (!cluster) return expr;
  const filter = `cluster="${escapeLabelValue(cluster)}"`;
  return expr.replace(
    /([a-zA-Z_:][a-zA-Z0-9_:]*)(\{([^}]*)\})?/g,
    (_match, name: string, _braces: string | undefined, labels: string | undefined) =>
      labels !== undefined ? `${name}{${filter},${labels}}` : `${name}{${filter}}`,
  );
};

/** Collects the union of keys from one or more maps. */
export const getAllKeysFromMaps = (...maps: Record<string, unknown>[]): Set<string> =>
  new Set(maps.flatMap((m) => Object.keys(m)));

type ResourceMaps = {
  cpu: Record<string, number>;
  memory: Record<string, number>;
  storage: Record<string, number>;
};

type ResourcePercentages = { cpu: number; memory: number; overall: number; storage: number };

/** Computes CPU / memory / storage percentages and an overall max for a single entity key. */
export const getResourcePercentages = (
  usedMaps: ResourceMaps,
  totalMaps: ResourceMaps,
  key: string,
): ResourcePercentages => {
  const cpu = pct(usedMaps.cpu[key] ?? 0, totalMaps.cpu[key] ?? 0);
  const memory = pct(usedMaps.memory[key] ?? 0, totalMaps.memory[key] ?? 0);
  const storage = pct(usedMaps.storage[key] ?? 0, totalMaps.storage[key] ?? 0);
  return { cpu, memory, overall: Math.max(cpu, memory, storage), storage };
};

/**
 * Builds a two-level map from Prometheus results grouped by two labels.
 * Returns `Record<outerKey, Record<innerKey, number>>`.
 */
export const buildNestedLabelMap = (
  results: PrometheusResult[],
  outerLabel: string,
  innerLabel: string,
): Record<string, Record<string, number>> => {
  const map: Record<string, Record<string, number>> = {};
  for (const r of results) {
    const outer = r.metric?.[outerLabel];
    const inner = r.metric?.[innerLabel];
    if (outer && inner) {
      map[outer] ??= {};
      map[outer][inner] = toFiniteNumber(r.value?.[1]);
    }
  }
  return map;
};
