import useIsACMPage from '@multicluster/useIsACMPage';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

/**
 * Resolves which cluster hosts the Console user-settings ConfigMap.
 * ACM stores settings on the hub cluster; non-ACM uses the local cluster (undefined).
 * @param cluster
 */
const useConsoleUserSettingsCluster = (cluster?: string): string | undefined => {
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();

  if (!isACMPage) {
    return undefined;
  }

  return cluster ?? hubClusterName;
};

export default useConsoleUserSettingsCluster;
