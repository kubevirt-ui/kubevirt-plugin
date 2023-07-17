import { useMemo } from 'react';

import { InfrastructureModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { useIsAdmin } from './useIsAdmin';

type UseSingleNodeCluster = () => [isSingleNodeCluster: boolean, loaded: boolean];
const useSingleNodeCluster: UseSingleNodeCluster = () => {
  const isAdmin = useIsAdmin();
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

  return isAdmin ? [isSingleNodeCluster, loaded] : [undefined, true];
};

export default useSingleNodeCluster;
