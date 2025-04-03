import { useMemo } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import {
  DirectVolumeMigration,
  DirectVolumeMigrationModel,
  LiveMigrationProgress,
  MigMigration,
  MigMigrationModel,
} from '../constants';

import { sortMigrationsProgresses } from './utils';

type UseProgressMigration = (migMigration: MigMigration) => {
  completedMigrationTimestamp: string;
  creationTimestamp: string;
  migrationProgresses: LiveMigrationProgress[];
  status: string;
};

const useProgressMigration: UseProgressMigration = (migMigration) => {
  const [watchMigMigration] = useK8sWatchResource<MigMigration>(
    migMigration
      ? {
          groupVersionKind: modelToGroupVersionKind(MigMigrationModel),
          name: getName(migMigration),
          namespace: getNamespace(migMigration),
        }
      : null,
  );

  const [directVolumeMigrations] = useK8sWatchResource<DirectVolumeMigration[]>(
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
        (directVolumeMigration) =>
          directVolumeMigration.metadata.ownerReferences?.[0].uid === migMigration.metadata.uid,
      ),
    [directVolumeMigrations, migMigration.metadata.uid],
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
      (condition) => condition.reason == 'Completed' && condition.status == 'True',
    )?.lastTransitionTime,
    creationTimestamp: migMigration?.metadata?.creationTimestamp,
    migrationProgresses,
    status: migMigration?.status?.phase || watchMigMigration?.status?.phase,
  };
};
export default useProgressMigration;
