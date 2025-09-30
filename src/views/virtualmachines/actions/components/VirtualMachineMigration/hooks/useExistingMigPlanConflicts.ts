import { useMemo } from 'react';
import intersection from 'lodash/intersection';

import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import {
  DEFAULT_MIGRATION_NAMESPACE,
  MigPlan,
  MigPlanModel,
} from '@kubevirt-utils/resources/migrations/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { getExistingMigPlanNamespaces } from '@virtualmachines/actions/components/VirtualMachineMigration/utils/utils';

type UseExistingMigPlanConflicts = (
  currentMigPlanCreation: MigPlan,
  vmNamespaces: string[],
  cluster?: string,
) => {
  migPlansLoaded: boolean;
  migPlansLoadError: boolean;
  namespaceConflicts: string[];
};

const useExistingMigPlanConflicts: UseExistingMigPlanConflicts = (
  currentMigPlanCreation,
  vmNamespaces,
  cluster,
) => {
  const [migrationPlans, loaded, loadError] = useK8sWatchData<MigPlan[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(MigPlanModel),
    isList: true,
    namespace: DEFAULT_MIGRATION_NAMESPACE,
  });

  const filteredMigPlans = migrationPlans.filter(
    (plan) => getName(plan) !== getName(currentMigPlanCreation),
  );

  const existingMigPlanNamespaces = useMemo(
    () => getExistingMigPlanNamespaces(filteredMigPlans),
    [filteredMigPlans],
  );
  const namespaceConflicts = intersection(vmNamespaces, existingMigPlanNamespaces);
  const migPlansLoaded = loaded && !loadError;

  return {
    migPlansLoaded,
    migPlansLoadError: loadError,
    namespaceConflicts,
  };
};

export default useExistingMigPlanConflicts;
