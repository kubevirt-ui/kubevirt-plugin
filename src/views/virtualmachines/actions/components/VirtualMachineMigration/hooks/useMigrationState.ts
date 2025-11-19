import { useCallback, useState } from 'react';

import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { getCluster } from '@multicluster/helpers/selectors';

import { SelectedMigration } from '../utils/constants';
import { migrateVMs } from '../utils/migrateVMs';

type UseMigrationState = (
  selectedMigrations: SelectedMigration[],
  destinationStorageClass: string,
) => {
  migrationError: Error;
  migrationLoading: boolean;
  migrationPlan?: MultiNamespaceVirtualMachineStorageMigrationPlan;
  migrationStarted: boolean;
  onSubmit: () => Promise<void>;
};

const useMigrationState: UseMigrationState = (selectedMigrations, destinationStorageClass) => {
  const [migrationError, setMigrationError] = useState<Error | null>(null);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [migrationStarted, setMigrationStarted] = useState(false);
  const [migrationPlan, setMigrationPlan] =
    useState<MultiNamespaceVirtualMachineStorageMigrationPlan>(null);
  const cluster = getCluster(selectedMigrations?.[0]?.pvc);

  const onSubmit = useCallback(async () => {
    setMigrationLoading(true);
    setMigrationError(null);
    try {
      setMigrationPlan(await migrateVMs(selectedMigrations, destinationStorageClass, cluster));

      setMigrationStarted(true);
    } catch (apiError) {
      setMigrationError(apiError);
    }

    setMigrationLoading(false);
  }, [selectedMigrations, destinationStorageClass, cluster]);

  return { migrationError, migrationLoading, migrationPlan, migrationStarted, onSubmit };
};

export default useMigrationState;
