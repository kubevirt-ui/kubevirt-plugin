import { type IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { CONFIGMAP_NAME, extractConfigMapBaseName, getJobContainers } from '../../utils/utils';

const extractNumber = (str: string, suffix: string): number => {
  const idx = str.indexOf(suffix);
  if (idx < 0) {
    return 0;
  }
  let start = idx - 1;
  while (start >= 0 && (str[start] === '.' || (str[start] >= '0' && str[start] <= '9'))) {
    start--;
  }
  const numStr = str.slice(start + 1, idx);
  return numStr ? Number.parseFloat(numStr) : 0;
};

export const formatGoDuration = (durationStr: string): string => {
  if (!durationStr) {
    return '';
  }

  try {
    if (durationStr.endsWith('ms')) {
      return '0s';
    }

    const hours = Math.floor(extractNumber(durationStr, 'h'));
    const minutes = Math.floor(extractNumber(durationStr, 'm'));
    const seconds = Math.round(extractNumber(durationStr, 's'));

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

export const getResultsConfigMapName = (jobName: string): string => `${jobName}-results`;

export const groupJobsByConfigMapName = (
  jobs: IoK8sApiBatchV1Job[],
): Map<string, IoK8sApiBatchV1Job[]> => {
  const map = new Map<string, IoK8sApiBatchV1Job[]>();
  for (const job of jobs) {
    const configMapName = getJobContainers(job)?.[0]?.env?.find(
      (env) => env.name === CONFIGMAP_NAME,
    )?.value;
    if (configMapName) {
      const baseName = extractConfigMapBaseName(configMapName);
      if (!map.has(baseName)) {
        map.set(baseName, []);
      }
      map.get(baseName)?.push(job);
    }
  }
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
