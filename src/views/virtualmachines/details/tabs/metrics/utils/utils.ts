import { ProgressVariant } from '@patternfly/react-core';

export enum MetricsTabExpendedSections {
  Migration = 'migration',
  Network = 'network',
  Storage = 'storage',
  Utilization = 'utilization',
}

export const getMigrationProgressVariant = (
  percentage: number,
  isFailed: boolean,
): null | ProgressVariant => {
  if (percentage === 100) return ProgressVariant.success;
  if (isFailed) return ProgressVariant.danger;

  return null;
};
