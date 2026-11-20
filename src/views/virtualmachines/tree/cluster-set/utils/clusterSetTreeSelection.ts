import { CLUSTER_LIST_FILTER_TYPE } from '@kubevirt-utils/utils/constants';
import { isEmpty, universalComparator } from '@kubevirt-utils/utils/utils';
import { type TreeViewDataItem } from '@patternfly/react-core';

import { CLUSTER_SELECTOR_PREFIX, CLUSTER_SET_SELECTOR_PREFIX } from '../../utils/constants';

type TreeViewDataItemWithHref = { href?: string } & TreeViewDataItem;

const sortClusterNames = (clusterNames: string[]): string[] =>
  [...clusterNames].sort((a, b) => universalComparator(a, b));

const getClusterNamesFromClusterSet = (clusterSetTreeItem: TreeViewDataItem): string[] =>
  (clusterSetTreeItem.children ?? []).reduce<string[]>((clusterNames, clusterTreeItem) => {
    const clusterName = clusterTreeItem.id?.replace(`${CLUSTER_SELECTOR_PREFIX}/`, '');
    if (clusterName) {
      clusterNames.push(clusterName);
    }
    return clusterNames;
  }, []);

const clusterNamesMatchSorted = (clusters: string[], clustersInQueryParams: string[]): boolean => {
  if (clusters.length !== clustersInQueryParams.length) {
    return false;
  }
  const sortedClusters = sortClusterNames(clusters);
  const sortedClustersInQueryParams = sortClusterNames(clustersInQueryParams);
  return sortedClusters.every((cluster, index) => cluster === sortedClustersInQueryParams[index]);
};

export const getClusterSetTreeItemMatchingClusterFilters = (
  dataMap: Record<string, TreeViewDataItemWithHref> | undefined,
  clustersInQueryParams: string[],
): TreeViewDataItemWithHref | undefined => {
  if (isEmpty(dataMap) || isEmpty(clustersInQueryParams)) {
    return undefined;
  }

  return Object.values(dataMap ?? {}).find((item) => {
    if (!item.id?.startsWith(CLUSTER_SET_SELECTOR_PREFIX)) {
      return false;
    }
    const clusterNames = getClusterNamesFromClusterSet(item);
    return clusterNamesMatchSorted(clusterNames, clustersInQueryParams);
  });
};

export const isClusterSetSelectedInQuery = (
  clustersInSet: string[],
  queryParams: string | undefined,
): boolean => {
  const params = new URLSearchParams(queryParams ?? '');
  const clustersInQueryParams = params.getAll(CLUSTER_LIST_FILTER_TYPE).filter(Boolean);
  return clusterNamesMatchSorted(clustersInSet, clustersInQueryParams);
};
