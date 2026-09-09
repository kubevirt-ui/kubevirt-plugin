import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';

type MigrationsConfigTooltipField = {
  field: string;
  getDisplayText: (value: boolean | number | string) => string;
  label: string;
};

export const getBooleanText = (value: boolean): string => (value ? t('Yes') : t('No'));

export const getBandwidthPerMigrationText = (bandwidth: number | string): string => {
  if (typeof bandwidth === 'string') return readableSizeUnit(bandwidth);
  return `${bandwidth}`;
};

export const getCompletionTimeoutText = (completionTimeout: number): string =>
  completionTimeout ? `${completionTimeout} sec` : NO_DATA_DASH;

export const migrationsConfigTooltipFields: MigrationsConfigTooltipField[] = [
  {
    field: 'bandwidthPerMigration',
    getDisplayText: getBandwidthPerMigrationText,
    label: t('Bandwidth per migration'),
  },
  { field: 'allowAutoConverge', getDisplayText: getBooleanText, label: t('Auto converge') },
  { field: 'allowPostCopy', getDisplayText: getBooleanText, label: t('Post copy') },
  {
    field: 'completionTimeoutPerGiB',
    getDisplayText: getCompletionTimeoutText,
    label: t('Completion timeout'),
  },
];
