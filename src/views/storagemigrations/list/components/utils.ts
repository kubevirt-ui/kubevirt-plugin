import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DirectVolumeMigration,
  MigMigration,
  MIGRATION_PHASES,
} from '@kubevirt-utils/resources/migrations/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ProgressVariant } from '@patternfly/react-core';

export const getStatusMigration = (
  migMigration: MigMigration,
  directVolumeMigration: DirectVolumeMigration,
): { title: string; variant?: ProgressVariant } => {
  if (isEmpty(migMigration?.status?.startTimestamp)) return { title: t('Pending'), variant: null };

  if (
    directVolumeMigration?.status?.failedLiveMigration ||
    directVolumeMigration?.status?.failedPods ||
    migMigration?.status?.phase === MIGRATION_PHASES.Failed
  )
    return { title: t('Failed'), variant: ProgressVariant.danger };

  if (migMigration?.status?.phase === MIGRATION_PHASES.Completed) {
    return { title: t('Completed'), variant: ProgressVariant.success };
  }

  return { title: t('Running'), variant: null };
};

export const getMigrationPercentage = (
  migMigration: MigMigration,
  directVolumeMigration: DirectVolumeMigration,
) => {
  if (isEmpty(migMigration?.status?.startTimestamp)) return 0;
  if (migMigration?.status?.phase === MIGRATION_PHASES.Completed) return 100;

  const successfulLiveMigration =
    directVolumeMigration?.status?.successfulLiveMigration?.length ||
    directVolumeMigration?.status?.successfulPods?.length ||
    0;

  const runningMigrationPercentages =
    (
      directVolumeMigration?.status?.runningLiveMigration ||
      directVolumeMigration?.status?.runningPods
    )?.map((migration) => migration?.lastObservedProgressPercent) || [];

  const totalPercentages =
    runningMigrationPercentages.reduce((acc, percentage) => acc + Number(percentage), 0) +
    successfulLiveMigration * 100;

  if (totalPercentages === 0) return 0;

  const total = runningMigrationPercentages?.length + successfulLiveMigration || 0;

  const average = totalPercentages / total;
  const averagePercentage = Math.round(average);
  return averagePercentage > 100 ? 100 : averagePercentage;
};
