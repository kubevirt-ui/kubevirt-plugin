/**
 *
 * @param resource k8s resource with optional cluster
 * @returns resource's cluster
 */
export const getCluster = <A extends K8sResourceCommon = K8sResourceCommon>(resource?: A) =>
  resource?.cluster;
