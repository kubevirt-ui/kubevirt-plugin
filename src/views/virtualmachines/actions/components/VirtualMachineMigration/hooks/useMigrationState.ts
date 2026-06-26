import { useCallback, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getStorageMigrationBackend } from '@kubevirt-utils/resources/migrations/backends';
import {
  type StorageMigrationAPI,
  MultiNamespaceVirtualMachineStorageMigrationPlan,
} from '@kubevirt-utils/resources/migrations/constants';
import { getCluster } from '@multicluster/helpers/selectors';

import { SelectedMigration } from '../utils/constants';

type UseMigrationState = (
  selectedMigrations: SelectedMigration[],
  destinationStorageClass: string,
  migrationPlanName: string,
  keepOriginalVolumes: boolean,
  storageMigAPI: StorageMigrationAPI,
) => {
  migrationError: Error | null;
  migrationLoading: boolean;
  migrationPlan?: MultiNamespaceVirtualMachineStorageMigrationPlan;
  migrationStarted: boolean;
  onSubmit: () => Promise<void>;
};

const useMigrationState: UseMigrationState = (
  selectedMigrations,
  destinationStorageClass,
  migrationPlanName,
  keepOriginalVolumes,
  storageMigAPI,
) => {
  const { t } = useKubevirtTranslation();
  const [migrationError, setMigrationError] = useState<Error | null>(null);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [migrationStarted, setMigrationStarted] = useState(false);
  const [migrationPlan, setMigrationPlan] =
    useState<MultiNamespaceVirtualMachineStorageMigrationPlan | null>(null);
  const cluster = getCluster(selectedMigrations?.[0]?.pvc);

  const backend = getStorageMigrationBackend(storageMigAPI);

  const migrate = useMemo(
    () =>
      backend?.migrateVMs ??
      (async () => {
        throw new Error(t('Storage migration is not available on this cluster.'));
      }),
    [backend, t],
  );

  const onSubmit = useCallback(async () => {
    setMigrationLoading(true);
    setMigrationError(null);
    try {
      setMigrationPlan(
        await migrate({
          cluster,
          destinationStorageClass,
          keepOriginalVolumes,
          migrationPlanName,
          selectedMigrations,
        }),
      );

      setMigrationStarted(true);
    } catch (apiError) {
      setMigrationError(apiError instanceof Error ? apiError : new Error(String(apiError)));
    }

    setMigrationLoading(false);
  }, [
    migrate,
    selectedMigrations,
    destinationStorageClass,
    cluster,
    migrationPlanName,
    keepOriginalVolumes,
  ]);

  return { migrationError, migrationLoading, migrationPlan, migrationStarted, onSubmit };
};

export default useMigrationState;
