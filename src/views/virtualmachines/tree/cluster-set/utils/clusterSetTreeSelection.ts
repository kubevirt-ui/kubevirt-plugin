import { CLUSTER_LIST_FILTER_TYPE } from '@kubevirt-utils/utils/constants';
import { isEmpty, universalComparator } from '@kubevirt-utils/utils/utils';

const sortClusterNames = (clusterNames: string[]): string[] =>
  [...clusterNames].sort((a, b) => universalComparator(a, b));

const clusterNamesMatchSorted = (clusters: string[], clustersInQueryParams: string[]): boolean => {
  if (clusters.length !== clustersInQueryParams.length) {
    return false;
  }
  const sortedClusters = sortClusterNames(clusters);
  const sortedClustersInQueryParams = sortClusterNames(clustersInQueryParams);
  return sortedClusters.every((cluster, index) => cluster === sortedClustersInQueryParams[index]);
};

const getClustersInQueryParams = (queryParams: string | undefined): string[] => {
  const params = new URLSearchParams(queryParams ?? '');
  return params.getAll(CLUSTER_LIST_FILTER_TYPE).filter(Boolean);
};

export const isClusterSetSelectedInQuery = (
  clustersInSet: string[],
  queryParams: string | undefined,
): boolean => {
  const clustersInQueryParams = getClustersInQueryParams(queryParams);
  return clusterNamesMatchSorted(clustersInSet, clustersInQueryParams);
};

export const isAnyClusterInSetSelectedInQuery = (
  clustersInSet: string[],
  queryParams: string | undefined,
): boolean => {
  if (isEmpty(clustersInSet)) return false;

  const clustersInQueryParams = getClustersInQueryParams(queryParams);

  return clustersInQueryParams.some((cluster) => clustersInSet.includes(cluster));
};
