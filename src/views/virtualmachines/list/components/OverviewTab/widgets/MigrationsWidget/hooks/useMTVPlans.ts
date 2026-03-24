import { PlanModel, V1beta1Plan } from '@kubev2v/types';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { MTV_MIGRATION_NAMESPACE } from '@multicluster/components/CrossClusterMigration/constants';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import useIsMTVInstalled from '@virtualmachines/actions/hooks/useIsMTVInstalled';

type UseMTVPlansResult = {
  isMTVInstalled: boolean;
  loaded: boolean;
  loadError: unknown;
  plans: V1beta1Plan[];
};

const useMTVPlans = (): UseMTVPlansResult => {
  const [isMTVInstalled, isMTVInFlight] = useIsMTVInstalled();

  const [plans, loaded, loadError] = useK8sWatchResource<V1beta1Plan[]>(
    isMTVInstalled
      ? {
          groupVersionKind: modelToGroupVersionKind(PlanModel),
          isList: true,
          namespace: MTV_MIGRATION_NAMESPACE,
        }
      : null,
  );

  return {
    isMTVInstalled,
    loaded: isMTVInstalled ? loaded : !isMTVInFlight,
    loadError: isMTVInstalled ? loadError : null,
    plans: plans ?? [],
  };
};

export default useMTVPlans;
