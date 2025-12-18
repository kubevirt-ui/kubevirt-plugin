import { TFunction } from 'react-i18next';
import { JSON_SCHEMA, load } from 'js-yaml';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { FilterValue, RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { CONFIGMAP_NAME, extractConfigMapBaseName, getJobContainers } from '../../utils/utils';

import {
  SELF_VALIDATION_RESULTS_KEY,
  SelfValidationParsedResults,
  TEST_PROGRESS_ANNOTATION_PREFIX,
  TestProgressAnnotations,
  TOTAL_TESTS_FAILED_KEY,
  TOTAL_TESTS_PASSED_KEY,
  TOTAL_TESTS_RUN_KEY,
  TOTAL_TESTS_SKIPPED_KEY,
} from './constants';

type ParseFailedTestResult = {
  description: string;
  title: string;
};

/**
 * Parses a failed test name into title (metadata tags) and description
 * Title: All bracketed tags at the beginning + any text immediately after (first line in YAML)
 * Description: Everything after the initial tags (remaining lines)
 */
export const parseFailedTest = (testName: string): ParseFailedTestResult => {
  const trimmedTestName = testName.trim();

  // Find where the continuous sequence of bracketed tags ends, including any text immediately after
  // Match pattern: [tag] groups (with optional spaces between), followed by optional non-space text
  // Example: [sig-network] [level:component]Networkpolicy
  const tagSequenceRegex = /^(\[[^\]]+\](?:\s*\[[^\]]+\])*\S*)/;
  const tagSequenceMatch = tagSequenceRegex.exec(trimmedTestName);

  if (!tagSequenceMatch) {
    // No tags found, treat entire string as description
    return {
      description: trimmedTestName,
      title: '',
    };
  }

  const title = tagSequenceMatch[1].trim();
  const description = trimmedTestName.substring(tagSequenceMatch[1].length).trim();

  return {
    description: description || trimmedTestName,
    title: title || '',
  };
};

type OverallProgressFromJob = {
  completed?: number;
  failed?: number;
  lastUpdated?: string;
  passed?: number;
  total?: number;
};

export const getOverallProgressFromJob = (job: IoK8sApiBatchV1Job): OverallProgressFromJob => {
  const annotations = (job?.metadata?.annotations || {}) as TestProgressAnnotations;
  const completed = annotations[`${TEST_PROGRESS_ANNOTATION_PREFIX}/completed`];
  const failed = annotations[`${TEST_PROGRESS_ANNOTATION_PREFIX}/failed`];
  const lastUpdated = annotations[`${TEST_PROGRESS_ANNOTATION_PREFIX}/last-updated`];
  const passed = annotations[`${TEST_PROGRESS_ANNOTATION_PREFIX}/passed`];
  const total = annotations[`${TEST_PROGRESS_ANNOTATION_PREFIX}/total`];
  return {
    completed: completed ? Number.parseInt(completed, 10) : undefined,
    failed: failed ? Number.parseInt(failed, 10) : undefined,
    lastUpdated: lastUpdated,
    passed: passed ? Number.parseInt(passed, 10) : undefined,
    total: total ? Number.parseInt(total, 10) : undefined,
  };
};

export const formatStatusTimestamp = (
  timestamp: string,
  t: TFunction,
  fallback?: string,
): string => {
  if (!timestamp) return fallback || t('Not available');
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) {
    return fallback || timestamp || t('Not available');
  }
  return d.toLocaleString();
};

/**
 * Parses self-validation results from ConfigMap data
 * Uses js-yaml to parse the YAML format
 * @param configMap - The ConfigMap containing the results
 * @returns Parsed results object or null if parsing fails
 */
export const parseResults = (
  configMap: IoK8sApiCoreV1ConfigMap,
): null | SelfValidationParsedResults => {
  if (!configMap?.data?.[SELF_VALIDATION_RESULTS_KEY]) return null;
  const resultsData = configMap.data[SELF_VALIDATION_RESULTS_KEY];

  try {
    // Parse YAML data using js-yaml with restrictive JSON_SCHEMA for defense-in-depth
    const parsed = load(resultsData, { schema: JSON_SCHEMA }) as null | SelfValidationParsedResults;
    return parsed || null;
  } catch (error) {
    kubevirtConsole.error('Error parsing results:', error);
    return null;
  }
};

export const getCompletedSummaryText = (
  resultsConfigMap: IoK8sApiCoreV1ConfigMap,
  fallback: string,
  t: TFunction,
): string => {
  const resultsSummary = parseResults(resultsConfigMap)?.summary;
  if (resultsSummary) {
    const total = Number(resultsSummary[TOTAL_TESTS_RUN_KEY]) || 0;
    const passed = Number(resultsSummary[TOTAL_TESTS_PASSED_KEY]) || 0;
    const failed = Number(resultsSummary[TOTAL_TESTS_FAILED_KEY]) || 0;
    const skipped = Number(resultsSummary[TOTAL_TESTS_SKIPPED_KEY]) || 0;

    return t('{{passed}}/{{total}} passed ({{failed}} failed, {{skipped}} skipped)', {
      failed,
      passed,
      skipped,
      total,
    });
  }
  return fallback;
};

export const getInProgressSummaryText = (
  job: IoK8sApiBatchV1Job,
  fallback: string,
  t: TFunction,
): string => {
  if (job) {
    const progress = getOverallProgressFromJob(job);
    if (progress.completed !== undefined && progress.total !== undefined) {
      const passed = progress.passed || 0;
      const failed = progress.failed || 0;
      const total = progress.total || 0;

      return t('{{passed}}/{{total}} passed ({{failed}} failed)', {
        failed,
        passed,
        total,
      });
    }
  }
  return fallback;
};

/**
 * Formats a Go time.Duration string to a human-readable format
 * Examples:
 * - "52m7.945204109s" -> "52m 8s" (rounds seconds)
 * - "48.746635586s" -> "49s" (rounds seconds)
 * - "1h2m3.456s" -> "1h 2m" (shows hours and minutes, no seconds)
 * - "23m25.20795303s" -> "23m 25s" (rounds seconds)
 * - "123.456ms" -> "0s" (milliseconds shown as 0s)
 */
export const formatGoDuration = (durationStr: string): string => {
  if (!durationStr) {
    return '';
  }

  try {
    const msRegex = /^(\d+(?:\.\d+)?)ms$/;
    const msMatch = msRegex.exec(durationStr);
    if (msMatch) {
      return '0s';
    }

    const hourRegex = /(\d+)h/;
    const minuteRegex = /(\d+)m/;
    const secondRegex = /(\d+(?:\.\d+)?)s/;

    const hourMatch = hourRegex.exec(durationStr);
    const minuteMatch = minuteRegex.exec(durationStr);
    const secondMatch = secondRegex.exec(durationStr);

    const hours = hourMatch ? Number.parseInt(hourMatch[1], 10) : 0;
    const minutes = minuteMatch ? Number.parseInt(minuteMatch[1], 10) : 0;
    const seconds = secondMatch ? Math.round(Number.parseFloat(secondMatch[1])) : 0;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    if (seconds > 0) {
      return `${seconds}s`;
    }
    return '0s';
  } catch (error) {
    kubevirtConsole.warn('Error parsing duration string:', durationStr, error);
    return durationStr;
  }
};

export const getCheckupsSelfValidationListFilters = (
  t: TFunction,
): RowFilter<IoK8sApiCoreV1ConfigMap>[] => [
  {
    filter: ({ selected }: FilterValue, obj: IoK8sApiCoreV1ConfigMap) => {
      const status = obj?.data?.[SELF_VALIDATION_RESULTS_KEY] ? 'completed' : 'running';
      return selected?.length === 0 || selected?.includes(status);
    },
    filterGroupName: t('Status'),
    items: [
      { id: 'completed', title: t('Completed') },
      { id: 'running', title: t('Running') },
    ],
    reducer: (obj) => {
      return obj?.data?.[SELF_VALIDATION_RESULTS_KEY] ? 'completed' : 'running';
    },
    type: 'self-validation-status',
  },
];

/**
 * Generates the results ConfigMap name from a job name
 * @param jobName - The name of the job
 * @returns The results ConfigMap name with '-results' suffix
 */
export const getResultsConfigMapName = (jobName: string): string => {
  return `${jobName}-results`;
};

/**
 * Groups jobs by their ConfigMap base name
 * Strips the -<number>-results suffix to get the base name
 * Sorts each group by creation time (newest first)
 * @param jobs - Array of jobs to group
 * @returns Map of base name to array of jobs, sorted by creation time (newest first)
 */
export const groupJobsByConfigMapName = (
  jobs: IoK8sApiBatchV1Job[],
): Map<string, IoK8sApiBatchV1Job[]> => {
  const map = new Map<string, IoK8sApiBatchV1Job[]>();
  for (const job of jobs) {
    const configMapName = getJobContainers(job)?.[0]?.env?.find(
      (env) => env.name === CONFIGMAP_NAME,
    )?.value;
    if (configMapName) {
      // Strip -<number>-results suffix to get the base name
      const baseName = extractConfigMapBaseName(configMapName);
      if (!map.has(baseName)) {
        map.set(baseName, []);
      }
      map.get(baseName)!.push(job);
    }
  }
  // Sort each job array by creation time (newest first)
  for (const jobList of map.values()) {
    jobList.sort((a, b) => {
      const timeA = a.metadata?.creationTimestamp
        ? new Date(a.metadata.creationTimestamp).getTime()
        : 0;
      const timeB = b.metadata?.creationTimestamp
        ? new Date(b.metadata.creationTimestamp).getTime()
        : 0;
      return timeB - timeA;
    });
  }
  return map;
};
