/**
 * True when `cluster` is a managed spoke (not the ACM hub / local cluster).
 */
export const isManagedSpokeCluster = (
  cluster: string | undefined,
  hubClusterName: string | undefined,
  hubClusterLoaded: boolean,
): boolean => Boolean(cluster) && hubClusterLoaded && cluster !== hubClusterName;
