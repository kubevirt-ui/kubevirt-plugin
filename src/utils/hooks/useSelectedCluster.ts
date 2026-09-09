import useIsACMPage from '@multicluster/useIsACMPage';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import useListClusters from './useListClusters';

/**
 * Returns a cluster name that a user has selected or the hub cluster if none have been selected yet.
 * @returns a cluster name if the page is an ACM page, otherwise undefined
 */
const useSelectedCluster = (): string | undefined => {
  const isACMPage = useIsACMPage();
  const clusters = useListClusters();
  const [hubClusterName] = useHubClusterName();
  return isACMPage ? (clusters?.[0] ?? hubClusterName) : undefined;
};

export default useSelectedCluster;
