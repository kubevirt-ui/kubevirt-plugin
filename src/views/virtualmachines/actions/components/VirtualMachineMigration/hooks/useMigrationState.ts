import { useState } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';

import { MigMigration, MigPlan } from '../../../../../../utils/resources/migrations/constants';
import { migrateVMs } from '../utils/migrateVMs';

type UseMigrationState = (
  migPlan: MigPlan,
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
  migPlan,
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
      setMigMigration(
        await migrateVMs(migPlan, namespacePVCs, pvcsToMigrate, destinationStorageClass),
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
