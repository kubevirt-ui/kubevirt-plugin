import { useMemo } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import {
  DirectVolumeMigration,
  DirectVolumeMigrationModel,
  LiveMigrationProgress,
  MigMigration,
  MigMigrationModel,
} from '@kubevirt-utils/resources/migrations/migrationsMtcConstants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const sortMigrationsProgresses = (a: LiveMigrationProgress, b: LiveMigrationProgress): number => {
  if (a.vmName === b.vmName) return a.pvcRef.name.localeCompare(b.pvcRef.name);
  return a.vmName.localeCompare(b.vmName);
};

type UseProgressMigrationMtc = (migMigration: MigMigration) => {
  completedMigrationTimestamp: string;
  creationTimestamp: string;
  error: unknown;
  migrationProgresses: LiveMigrationProgress[];
  status: string;
};

const useProgressMigrationMtc: UseProgressMigrationMtc = (migMigration) => {
  const [watchMigMigration, , migMigrationError] = useK8sWatchResource<MigMigration>(
    migMigration
      ? {
          groupVersionKind: modelToGroupVersionKind(MigMigrationModel),
          name: getName(migMigration),
          namespace: getNamespace(migMigration),
        }
      : null,
  );

  const [directVolumeMigrations, , directVolumeError] = useK8sWatchResource<
    DirectVolumeMigration[]
  >(
    migMigration
      ? {
          groupVersionKind: modelToGroupVersionKind(DirectVolumeMigrationModel),
          isList: true,
          namespace: getNamespace(migMigration),
        }
      : null,
  );

  const currentDirectVolumeMigration = useMemo(
    () =>
      directVolumeMigrations?.find(
        (dvm) => dvm.metadata.ownerReferences?.[0]?.uid === migMigration?.metadata?.uid,
      ),
    [directVolumeMigrations, migMigration?.metadata?.uid],
  );

  const migrationProgresses = useMemo(
    () =>
      [
        ...(currentDirectVolumeMigration?.status?.runningLiveMigration || []),
        ...(currentDirectVolumeMigration?.status?.successfulLiveMigration || []),
      ].sort(sortMigrationsProgresses),
    [currentDirectVolumeMigration],
  );

  return {
    completedMigrationTimestamp: watchMigMigration?.status?.conditions?.find(
      (c) => c.reason === 'Completed' && c.status === 'True',
    )?.lastTransitionTime,
    creationTimestamp: migMigration?.metadata?.creationTimestamp,
    error: migMigrationError || directVolumeError,
    migrationProgresses,
    status: migMigration?.status?.phase || watchMigMigration?.status?.phase,
  };
};

export default useProgressMigrationMtc;
