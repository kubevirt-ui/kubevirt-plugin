import { useMemo } from 'react';

import { InfrastructureModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import {
  K8sResourceCommon,
  K8sVerb,
  useAccessReview,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

type UseSingleNodeCluster = () => [isSingleNodeCluster: boolean, loaded: boolean];
const useSingleNodeCluster: UseSingleNodeCluster = () => {
  const [canAccessInfra] = useAccessReview({
    group: InfrastructureModel.apiGroup,
    resource: InfrastructureModel.plural,
    verb: 'list' as K8sVerb,
  });

  const [infrastructure, loaded] = useK8sWatchResource<
    K8sResourceCommon & {
      status: { infrastructureTopology: string };
    }
  >({
    groupVersionKind: modelToGroupVersionKind(InfrastructureModel),
    namespaced: false,
  });

  const isSingleNodeCluster = useMemo(
    () => infrastructure?.status?.infrastructureTopology === 'SingleReplica',
    [infrastructure],
  );

  return canAccessInfra ? [isSingleNodeCluster, loaded] : [undefined, true];
};

export default useSingleNodeCluster;
