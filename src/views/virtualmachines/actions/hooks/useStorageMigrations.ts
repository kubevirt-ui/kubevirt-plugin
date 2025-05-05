import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import {
  DEFAULT_MIGRATION_NAMESPACE,
  MigMigration,
  MigMigrationModel,
  MigPlan,
  MigPlanModel,
} from '@kubevirt-utils/resources/migrations/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import useIsMTCInstalled from './useIsMTCInstalled';
import { getVMMigPlans, sortMigPlansByCreationTimestamp } from './utils';

const useCurrentStorageMigration = (vm: V1VirtualMachine): [MigMigration, boolean] => {
  const mtcInstalled = useIsMTCInstalled();

  const [migPlans, migPlansLoaded] = useK8sWatchResource<MigPlan[]>(
    mtcInstalled
      ? {
          groupVersionKind: modelToGroupVersionKind(MigPlanModel),
          isList: true,
          namespace: DEFAULT_MIGRATION_NAMESPACE,
        }
      : null,
  );

  const [migMigrations, migMigrationsLoaded] = useK8sWatchResource<MigMigration[]>(
    mtcInstalled
      ? {
          groupVersionKind: modelToGroupVersionKind(MigMigrationModel),
          isList: true,
          namespace: DEFAULT_MIGRATION_NAMESPACE,
        }
      : null,
  );

  const vmMigPlans = getVMMigPlans(vm, migPlans)?.sort(sortMigPlansByCreationTimestamp);

  const latestVMMigPlan = vmMigPlans?.[vmMigPlans?.length - 1];

  const currentMigration = migMigrations?.find(
    (migMigration) =>
      migMigration?.spec?.migPlanRef?.name === getName(latestVMMigPlan) &&
      migMigration.status?.phase !== 'Completed',
  );

  return [currentMigration, migMigrationsLoaded && migPlansLoaded];
};

export default useCurrentStorageMigration;
