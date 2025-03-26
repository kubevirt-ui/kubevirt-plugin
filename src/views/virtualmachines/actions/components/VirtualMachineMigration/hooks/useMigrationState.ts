import { useState } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { MigMigration } from '../constants';
import { migrateBulkVMs } from '../utils/migrateBulkVMs';
import { migrateVM } from '../utils/migrateVM';

type UseMigrationState = (
  vms: V1VirtualMachine[],
  namespacePVCs: IoK8sApiCoreV1PersistentVolumeClaim[],
  pvcsToMigrate: IoK8sApiCoreV1PersistentVolumeClaim[],
  destinationStorageClass: string,
) => {
  migMigration?: MigMigration;
  migrationError: Error;
  migrationLoading: boolean;
  migrationStarted: boolean;
  onSubmit: () => Promise<void>;
};

const useMigrationState: UseMigrationState = (
  vms,
  namespacePVCs,
  pvcsToMigrate,
  destinationStorageClass,
) => {
  const [migrationError, setMigrationError] = useState<Error | null>(null);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [migrationStarted, setMigrationStarted] = useState(false);
  const [migMigration, setMigMigration] = useState<MigMigration>(null);

  const onSubmit = async () => {
    setMigrationLoading(true);
    setMigrationError(null);
    try {
      vms.length === 1
        ? await migrateVM(vms?.[0], pvcsToMigrate, destinationStorageClass)
        : setMigMigration(
            await migrateBulkVMs(vms, namespacePVCs, pvcsToMigrate, destinationStorageClass),
          );

      setMigrationStarted(true);
    } catch (apiError) {
      setMigrationError(apiError);
    }

    setMigrationLoading(false);
  };

  return { migMigration, migrationError, migrationLoading, migrationStarted, onSubmit };
};

export default useMigrationState;
