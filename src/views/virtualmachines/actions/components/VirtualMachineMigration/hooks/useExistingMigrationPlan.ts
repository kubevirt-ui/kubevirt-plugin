import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import {
  DEFAULT_MIGRATION_NAMESPACE,
  MigPlan,
  MigPlanModel,
} from '@kubevirt-utils/resources/migrations/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useExistingMigrationPlan = (
  currentMigPlanCreation: MigPlan,
  namespace: string,
): [existingMigPlan: MigPlan[], loaded: boolean] => {
  const [migrationPlans, loaded, loadError] = useK8sWatchResource<MigPlan[]>({
    groupVersionKind: modelToGroupVersionKind(MigPlanModel),
    isList: true,
    namespace: DEFAULT_MIGRATION_NAMESPACE,
  });

  const migrationPlansLoaded = loaded && !loadError;

  const existMigPlanInNamespace = migrationPlans?.filter(
    (plan) =>
      plan.spec.namespaces.find((ns) => ns === namespace) &&
      getName(plan) !== getName(currentMigPlanCreation),
  );

  return [existMigPlanInNamespace, migrationPlansLoaded];
};

export default useExistingMigrationPlan;
