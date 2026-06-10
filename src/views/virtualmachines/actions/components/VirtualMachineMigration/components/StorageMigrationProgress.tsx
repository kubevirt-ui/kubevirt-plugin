import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getStorageMigrationPlanModelForKind } from '@kubevirt-utils/resources/migrations/backends/planModels';
import type { ProgressComponentProps } from '@kubevirt-utils/resources/migrations/backends/types';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';

import useStorageMigrationPlanCancel from '../hooks/useStorageMigrationPlanCancel';
import useStorageMigrationProgressMetrics from '../hooks/useStorageMigrationProgressMetrics';

import MigrationProgressDisplay from './MigrationProgressDisplay';
import MigrationStatusShell from './MigrationStatusShell';

export type StorageMigrationProgressProps = ProgressComponentProps & {
  basePath: string;
  fetchingError?: Error;
  isExternal: boolean;
  watchStorageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan;
};

const StorageMigrationProgress: FC<StorageMigrationProgressProps> = ({
  basePath,
  cluster,
  fetchingError,
  isExternal,
  onClose,
  storageMigrationPlan,
  watchStorageMigrationPlan,
}) => {
  const { t } = useKubevirtTranslation();

  const {
    failedMigrations,
    hasFailed,
    migrationCompleted,
    migrationHeading,
    migrationIcon,
    migrationStatus,
  } = useStorageMigrationProgressMetrics(watchStorageMigrationPlan, t);

  const planModel = getStorageMigrationPlanModelForKind(storageMigrationPlan?.kind);
  const { cancelError, onCancelMigration } = useStorageMigrationPlanCancel({
    cluster,
    onClose,
    planModel,
    storageMigrationPlan,
  });

  return (
    <MigrationStatusShell onHeaderClose={onClose}>
      <MigrationProgressDisplay
        basePath={basePath}
        cancelError={cancelError}
        failedVmCount={failedMigrations.length}
        fetchingError={fetchingError}
        hasFailed={hasFailed}
        isExternal={isExternal}
        migrationCompleted={migrationCompleted}
        migrationHeading={migrationHeading}
        migrationIcon={migrationIcon}
        migrationStatus={migrationStatus}
        onCancelMigration={onCancelMigration}
        onClose={onClose}
      />
    </MigrationStatusShell>
  );
};

export default StorageMigrationProgress;
