import { useMemo } from 'react';

import { InfrastructureModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource';

type UseSingleNodeCluster = () => [isSingleNodeCluster: boolean, loaded: boolean];
const useSingleNodeCluster: UseSingleNodeCluster = () => {
  const [infrastructure, loaded] = useKubevirtWatchResource({
    groupVersionKind: modelToGroupVersionKind(InfrastructureModel),
    namespaced: false,
  });

  const isSingleNodeCluster = useMemo(
    () => infrastructure?.status?.infrastructureTopology === 'SingleReplica',
    [infrastructure],
  );

  return [isSingleNodeCluster, loaded];
};

export default useSingleNodeCluster;
