import type { TFunction } from 'i18next';

export const DEFAULT_DISK_SIZE = '30Gi';
export const DEFAULT_RETAIN_REVISIONS = 3;

export const getOperatingSystemLabel = (t: TFunction): string => t('Operating system');
