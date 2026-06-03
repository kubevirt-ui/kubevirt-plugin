import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { CLUSTER_LIST_FILTER_PARAM } from '@kubevirt-utils/utils/constants';

const useSelectedRowFilterClusters = (
  filterParam: string = CLUSTER_LIST_FILTER_PARAM,
): string[] => {
  const [searchParams] = useSearchParams();
  const clusterParam = searchParams.get(filterParam);
  return useMemo(() => clusterParam?.split(',') ?? [], [clusterParam]);
};

export default useSelectedRowFilterClusters;
