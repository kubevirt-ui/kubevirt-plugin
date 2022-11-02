import { useMemo } from 'react';

import { InfrastructureModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource';

import { useIsAdmin } from './useIsAdmin';

type UseSingleNodeCluster = () => [isSingleNodeCluster: boolean, loaded: boolean];
const useSingleNodeCluster: UseSingleNodeCluster = () => {
  const isAdmin = useIsAdmin();
  const [infrastructure, loaded] = useKubevirtWatchResource({
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
