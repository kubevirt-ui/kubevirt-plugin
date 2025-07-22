import { useMemo } from 'react';

import { ClusterVersionModel, modelToGroupVersionKind } from '@kubevirt-utils/models';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { ClusterVersion } from './constants';

const useClusterVersion = (cluster?: string): [string | undefined, boolean, any] => {
  const [clusterVersionResource, clusterVersionLoaded, clusterVersionError] = useK8sWatchData<
    ClusterVersion[]
  >({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ClusterVersionModel),
    isList: true,
  });

  const clusterVersion = useMemo(() => {
    return clusterVersionResource?.find((version) => version?.status?.desired?.version)?.status
      ?.desired?.version;
  }, [clusterVersionResource]);

  return [clusterVersion, clusterVersionLoaded, clusterVersionError];
};

export default useClusterVersion;
