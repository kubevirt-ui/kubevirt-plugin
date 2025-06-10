import { useMemo } from 'react';

import { InfrastructureModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { K8sResourceCommon, K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';

import useMemoizedParams from './useMemoizedParams';

type UseSingleNodeCluster = () => [isSingleNodeCluster: boolean, loaded: boolean];
const useSingleNodeCluster: UseSingleNodeCluster = () => {
  const { cluster } = useMemoizedParams<{ cluster?: string }>();

  const [canAccessInfra] = useAccessReview({
    group: InfrastructureModel.apiGroup,
    resource: InfrastructureModel.plural,
    verb: 'list' as K8sVerb,
  });

  const [infrastructure, loaded] = useFleetK8sWatchResource<
    K8sResourceCommon & {
      status: { infrastructureTopology: string };
    }
  >({
    cluster,
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
