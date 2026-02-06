import { useMemo } from 'react';

import { modelToGroupVersionKind, NetworkConfigModel } from '@kubevirt-utils/models';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';

type NetworkConfig = K8sResourceKind & {
  status?: {
    clusterNetwork?: { cidr: string; hostPrefix: number }[];
    serviceNetwork?: string[];
  };
};

const isIPv6CIDR = (cidr: string): boolean => cidr?.includes(':');

const useIsIPv6SingleStackCluster = (cluster?: string): boolean => {
  const [networkConfig] = useK8sWatchData<NetworkConfig>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NetworkConfigModel),
    name: 'cluster',
  });

  const isIPv6SingleStack = useMemo(
    () =>
      Boolean(
        networkConfig?.status?.clusterNetwork?.every((net) => isIPv6CIDR(net.cidr)) &&
          networkConfig?.status?.serviceNetwork?.every((cidr) => isIPv6CIDR(cidr)),
      ),
    [networkConfig],
  );

  return isIPv6SingleStack;
};

export default useIsIPv6SingleStackCluster;
