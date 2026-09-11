import { type ComponentType, useMemo } from 'react';
import type { TFunction } from 'i18next';

import type {
  MigrationStatus,
  MultiNamespaceVirtualMachineStorageMigrationPlan,
} from '@kubevirt-utils/resources/migrations/constants';
import { isMigrationCompleted } from '@kubevirt-utils/resources/migrations/utils';
import { type EmptyStateStatus } from '@patternfly/react-core';
import type { SVGIconProps } from '@patternfly/react-icons/dist/esm/createIcon';

import { getFailedMigrations, getMigrationStateConfig } from '../utils/utils';

export type StorageMigrationProgressMetrics = {
  failedMigrations: MigrationStatus[];
  hasFailed: boolean;
  migrationCompleted: boolean;
  migrationHeading: string;
  migrationIcon: ComponentType<SVGIconProps>;
  migrationStatus: EmptyStateStatus;
};

/**
 * Derives completion, failure list, and presentation config from a watched or polled plan.
 */
const useStorageMigrationProgressMetrics = (
  watchStorageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan | null | undefined,
  t: TFunction,
): StorageMigrationProgressMetrics =>
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
