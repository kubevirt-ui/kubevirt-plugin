import { useMemo } from 'react';

import { InfrastructureModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { useIsAdmin } from './useIsAdmin';

type UseSingleNodeCluster = () => [isSingleNodeCluster: boolean, loaded: boolean];
const useSingleNodeCluster: UseSingleNodeCluster = () => {
  const isAdmin = useIsAdmin();
  const [infrastructure, loaded] = useKubevirtWatchResource<
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
