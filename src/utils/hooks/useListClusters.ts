import { useMemo } from 'react';

import useClusterParam from '@multicluster/hooks/useClusterParam';

import { isEmpty } from '../utils/utils';

import useSelectedRowFilterClusters from './useSelectedRowFilterClusters';

const useListClusters = (): string[] => {
  const rowFilterClusters = useSelectedRowFilterClusters();
  const cluster = useClusterParam();
  const clusters = useMemo(() => {
    if (!isEmpty(rowFilterClusters)) return rowFilterClusters;
    if (cluster) return [cluster];
    return [];
  }, [rowFilterClusters, cluster]);
  return clusters;
};

export default useListClusters;
