import { useMemo } from 'react';

import { CLUSTER_LIST_FILTER_PARAM } from '@kubevirt-utils/utils/constants';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { isEmpty } from '../utils/utils';

import useSelectedRowFilterClusters from './useSelectedRowFilterClusters';

const useListClusters = (filterParam: string = CLUSTER_LIST_FILTER_PARAM): string[] => {
  const rowFilterClusters = useSelectedRowFilterClusters(filterParam);
  const cluster = useClusterParam();
  const clusters = useMemo(() => {
    if (!isEmpty(rowFilterClusters)) return rowFilterClusters;
    if (cluster) return [cluster];
    return [];
  }, [rowFilterClusters, cluster]);
  return clusters;
};

export default useListClusters;
