import {
  DEFAULT_MIGRATION_NAMESPACE,
  DirectVolumeMigration,
  DirectVolumeMigrationModel,
  MigMigration,
  MigMigrationModel,
  MigPlan,
  MigPlanModel,
} from '@kubevirt-utils/resources/migrations/constants';
import {
  getGroupVersionKindForModel,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

type UseStorageMigrationResources = () => {
  directVolumeMigrations: DirectVolumeMigration[];
  loaded: boolean;
  loadError: any;
  migMigrations: MigMigration[];
  migPlans: MigPlan[];
};

const useStorageMigrationResources: UseStorageMigrationResources = () => {
  const [migPlans, plansLoaded, plansError] = useK8sWatchResource<MigPlan[]>({
    groupVersionKind: getGroupVersionKindForModel(MigPlanModel),
    isList: true,
    namespace: DEFAULT_MIGRATION_NAMESPACE,
    namespaced: true,
  });

  const storageMigPlans =
    migPlans?.filter((plan) => plan?.spec?.persistentVolumes?.length > 0) ?? [];

  const [migMigrations, migrationsLoaded, migrationsError] = useK8sWatchResource<MigMigration[]>({
    groupVersionKind: getGroupVersionKindForModel(MigMigrationModel),
    isList: true,
    namespace: DEFAULT_MIGRATION_NAMESPACE,
    namespaced: true,
  });

  const [directVolumeMigrations, dvLoaded, dvError] = useK8sWatchResource<DirectVolumeMigration[]>({
    groupVersionKind: getGroupVersionKindForModel(DirectVolumeMigrationModel),
    isList: true,
    namespace: DEFAULT_MIGRATION_NAMESPACE,
    namespaced: true,
  });

  return {
    directVolumeMigrations,
    loaded: plansLoaded && migrationsLoaded && dvLoaded,
    loadError: plansError || migrationsError || dvError,
    migMigrations,
    migPlans: storageMigPlans,
  };
};

export default useStorageMigrationResources;
