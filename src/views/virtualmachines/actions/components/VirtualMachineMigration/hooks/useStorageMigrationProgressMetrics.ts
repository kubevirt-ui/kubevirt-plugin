import { useMemo } from 'react';
import type { TFunction } from 'i18next';

import type { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { isMigrationCompleted } from '@kubevirt-utils/resources/migrations/utils';

import { getFailedMigrations, getMigrationStateConfig } from '../utils/utils';

/**
 * Derives completion, failure list, and presentation config from a watched or polled plan.
 */
const useStorageMigrationProgressMetrics = (
  watchStorageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan | null | undefined,
  t: TFunction,
) =>
  useMemo(() => {
    const migrationCompleted = isMigrationCompleted(watchStorageMigrationPlan);
    const failedMigrations = getFailedMigrations(watchStorageMigrationPlan);
    const hasFailed = failedMigrations.length > 0;
    const { migrationHeading, migrationIcon, migrationStatus } = getMigrationStateConfig(
      migrationCompleted,
      hasFailed,
      t,
    );
    return {
      failedMigrations,
      hasFailed,
      migrationCompleted,
      migrationHeading,
      migrationIcon,
      migrationStatus,
    };
  }, [watchStorageMigrationPlan, t]);

export default useStorageMigrationProgressMetrics;
