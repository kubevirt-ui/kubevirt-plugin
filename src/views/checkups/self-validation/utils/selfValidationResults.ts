import { TFunction } from 'react-i18next';
import { load } from 'js-yaml';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { FilterValue, RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { CheckupsStatus, STATUS_SUCCEEDED } from '../../utils/utils';

import { SELF_VALIDATION_RESULTS_KEY } from './constants';

// ===========================
// Status Helpers
// ===========================

export const getConfigMapStatus = (
  configMap: IoK8sApiCoreV1ConfigMap,
  jobStatus: CheckupsStatus,
): CheckupsStatus => {
  if (configMap.data?.[STATUS_SUCCEEDED] === 'true') {
    return CheckupsStatus.Done;
  }
  return jobStatus;
};

// ===========================
// Result Parsing
// ===========================

/**
 * Parses a failed test name into title (metadata tags) and description
 * Title: All bracketed tags at the beginning + any text immediately after (first line in YAML)
 * Description: Everything after the initial tags (remaining lines)
 */
export const parseFailedTest = (testName: string) => {
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

export const getOverallProgressFromJob = (job: IoK8sApiBatchV1Job) => {
  const annotations = job?.metadata?.annotations || {};

  return {
    completed: annotations['test-progress/completed']
      ? Number.parseInt(annotations['test-progress/completed'], 10)
      : undefined,
    failed: annotations['test-progress/failed']
      ? Number.parseInt(annotations['test-progress/failed'], 10)
      : undefined,
    lastUpdated: annotations['test-progress/last-updated'],
    passed: annotations['test-progress/passed']
      ? Number.parseInt(annotations['test-progress/passed'], 10)
      : undefined,
    total: annotations['test-progress/total']
      ? Number.parseInt(annotations['test-progress/total'], 10)
      : undefined,
  };
};

export const formatStatusTimestamp = (timestamp: string, t: TFunction, fallback?: string) => {
  if (!timestamp) return fallback || t('Not available');
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return timestamp;
  }
};

/**
 * Parses self-validation results from ConfigMap data
 * Uses js-yaml to parse the YAML format
 * @param configMap - The ConfigMap containing the results
 * @returns Parsed results object or null if parsing fails
 */
export const parseResults = (configMap: IoK8sApiCoreV1ConfigMap) => {
  if (!configMap?.data?.[SELF_VALIDATION_RESULTS_KEY]) return null;
  const resultsData = configMap.data[SELF_VALIDATION_RESULTS_KEY];

  try {
    // Parse YAML data using js-yaml
    const parsed = load(resultsData) as Record<string, any>;
    return parsed || null;
  } catch (error) {
    kubevirtConsole.error('Error parsing results:', error);
    return null;
  }
};

export const getSummaryText = (job: IoK8sApiBatchV1Job, fallback: string) => {
  if (job) {
    const progress = getOverallProgressFromJob(job);
    if (progress.completed !== undefined && progress.total !== undefined) {
      const passed = progress.passed || 0;
      const failed = progress.failed || 0;
      const total = progress.total || 0;

      return `${passed}/${total} passed (${failed} failed)`;
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

// ===========================
// List Filters
// ===========================

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
