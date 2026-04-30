import { useCallback, useState } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { MigMigration } from '@kubevirt-utils/resources/migrations/migrationsMtcConstants';

import { SelectedMigration } from '../utils/constants';
import { migrateVMsMtc } from '../utils/migrateVMsMtc';

type UseMigrationStateMtc = (
  selectedMigrations: SelectedMigration[],
  allNamespacePVCs: IoK8sApiCoreV1PersistentVolumeClaim[],
  destinationStorageClass: string,
) => {
  migMigration?: MigMigration;
  migrationError: Error;
  migrationLoading: boolean;
  migrationStarted: boolean;
  onSubmit: () => Promise<void>;
};

const useMigrationStateMtc: UseMigrationStateMtc = (
  selectedMigrations,
  allNamespacePVCs,
  destinationStorageClass,
) => {
  const [migrationError, setMigrationError] = useState<Error | null>(null);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [migrationStarted, setMigrationStarted] = useState(false);
  const [migMigration, setMigMigration] = useState<MigMigration>(null);

  const onSubmit = useCallback(async () => {
    setMigrationLoading(true);
    setMigrationError(null);
    try {
      setMigMigration(
        await migrateVMsMtc(selectedMigrations, allNamespacePVCs, destinationStorageClass),
      );
      setMigrationStarted(true);
    } catch (apiError) {
      setMigrationError(apiError);
    }
    setMigrationLoading(false);
  }, [selectedMigrations, allNamespacePVCs, destinationStorageClass]);

  return { migMigration, migrationError, migrationLoading, migrationStarted, onSubmit };
};

export default useMigrationStateMtc;
