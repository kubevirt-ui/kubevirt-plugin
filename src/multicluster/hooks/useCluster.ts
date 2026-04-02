import { useHubClusterName } from '@stolostron/multicluster-sdk';

import useClusterParam from './useClusterParam';

const useCluster = (): string | undefined => {
  const clusterParam = useClusterParam();
  const [hubClusterName] = useHubClusterName();

  return clusterParam || hubClusterName;
};

export default useCluster;
