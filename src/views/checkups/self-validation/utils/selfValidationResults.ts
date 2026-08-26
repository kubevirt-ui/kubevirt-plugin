import { type TFunction } from 'i18next';
import { JSON_SCHEMA, load } from 'js-yaml';

import {
  type IoK8sApiBatchV1Job,
  type IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import {
  SELF_VALIDATION_RESULTS_KEY,
  type SelfValidationParsedResults,
  TEST_PROGRESS_ANNOTATION_PREFIX,
  type TestProgressAnnotations,
  TOTAL_TESTS_FAILED_KEY,
  TOTAL_TESTS_PASSED_KEY,
  TOTAL_TESTS_RUN_KEY,
  TOTAL_TESTS_SKIPPED_KEY,
} from './constants';

type ParseFailedTestResult = {
  description: string;
  title: string;
};

export const parseFailedTest = (testName: string): ParseFailedTestResult => {
  const trimmedTestName = testName.trim();

  const tagSequenceRegex = /^(\[[^\]]+\](?:\s*\[[^\]]+\])*\S*)/;
  const tagSequenceMatch = tagSequenceRegex.exec(trimmedTestName);

  if (!tagSequenceMatch) {
    return {
      description: trimmedTestName,
      title: '',
    };
  }

  const title = tagSequenceMatch[1].trim();
  const description = trimmedTestName.substring(tagSequenceMatch[1].length).trim();

  return {
    description: description || trimmedTestName,
    title: title ?? '',
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
  const annotations = (job?.metadata?.annotations ?? {}) as TestProgressAnnotations;
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
  if (!timestamp) {
    return fallback ?? t('Not available');
  }
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return fallback ?? timestamp ?? t('Not available');
  }
  return date.toLocaleString();
};

export const parseResults = (
  configMap: IoK8sApiCoreV1ConfigMap,
): null | SelfValidationParsedResults => {
  if (!configMap?.data?.[SELF_VALIDATION_RESULTS_KEY]) {
    return null;
  }
  const resultsData = configMap.data[SELF_VALIDATION_RESULTS_KEY];

  try {
    const parsed = load(resultsData, { schema: JSON_SCHEMA }) as null | SelfValidationParsedResults;
    return parsed ?? null;
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
    const total = Number(resultsSummary[TOTAL_TESTS_RUN_KEY] ?? 0);
    const passed = Number(resultsSummary[TOTAL_TESTS_PASSED_KEY] ?? 0);
    const failed = Number(resultsSummary[TOTAL_TESTS_FAILED_KEY] ?? 0);
    const skipped = Number(resultsSummary[TOTAL_TESTS_SKIPPED_KEY] ?? 0);

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
      const passed = progress.passed ?? 0;
      const failed = progress.failed ?? 0;
      const total = progress.total ?? 0;

      return t('{{passed}}/{{total}} passed ({{failed}} failed)', {
        failed,
        passed,
        total,
      });
    }
  }
  return fallback;
};

export {
  formatGoDuration,
  getResultsConfigMapName,
  groupJobsByConfigMapName,
} from './selfValidationDuration';
