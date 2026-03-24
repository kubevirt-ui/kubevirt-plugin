import { TFunction } from 'react-i18next';

import { ScoreStatus } from '../../shared/StatusScoreList/StatusScoreList';

export const THRESHOLD_HIGH = 90;
export const THRESHOLD_MEDIUM = 50;
export const TOP_N = 5;

export const SEVERITY_HIGH = 'high' as const;
export const SEVERITY_MEDIUM = 'medium' as const;
export const SEVERITY_LOW = 'low' as const;

export type SeverityLevel = typeof SEVERITY_HIGH | typeof SEVERITY_LOW | typeof SEVERITY_MEDIUM;

export type SeverityCount = {
  count: number;
  level: SeverityLevel;
  status: ScoreStatus;
};

export const SEVERITY_STATUS_MAP: Record<SeverityLevel, ScoreStatus> = {
  [SEVERITY_HIGH]: 'danger',
  [SEVERITY_LOW]: 'info',
  [SEVERITY_MEDIUM]: 'warning',
};

export const SEVERITY_ORDER: SeverityLevel[] = [SEVERITY_HIGH, SEVERITY_MEDIUM, SEVERITY_LOW];

export const getSeverityLabel = (level: SeverityLevel, t: TFunction): string => {
  switch (level) {
    case SEVERITY_HIGH:
      return t('high');
    case SEVERITY_MEDIUM:
      return t('medium');
    case SEVERITY_LOW:
      return t('low');
  }
};

export const getItemLabel = (count: number, t: TFunction, itemLabel?: string): string => {
  if (itemLabel) return itemLabel;
  return count === 1 ? t('cluster') : t('clusters');
};

export const INSTANCE_TO_NODE = 'label_replace(%EXPR%, "node", "$1", "instance", "([^:]+).*")';

export const STORAGE_FS_FILTER = '{fstype!~"tmpfs|ramfs|rootfs"}';

export const CPU_USED_EXPR = 'instance:node_cpu_utilisation:rate1m * instance:node_num_cpu:sum';
export const CPU_TOTAL_EXPR = 'instance:node_num_cpu:sum';
export const MEMORY_USED_EXPR = 'node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes';
export const MEMORY_TOTAL_EXPR = 'node_memory_MemTotal_bytes';
export const STORAGE_USED_EXPR = `node_filesystem_size_bytes${STORAGE_FS_FILTER} - node_filesystem_avail_bytes${STORAGE_FS_FILTER}`;
export const STORAGE_TOTAL_EXPR = `node_filesystem_size_bytes${STORAGE_FS_FILTER}`;
