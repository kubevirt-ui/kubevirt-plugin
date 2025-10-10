import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { CLUSTER_LIST_FILTER_PARAM } from '@kubevirt-utils/utils/constants';

const useSelectedRowFilterClusters = (): string[] => {
  const [searchParams] = useSearchParams();
  const clusterParam = searchParams.get(CLUSTER_LIST_FILTER_PARAM);
  return useMemo(() => clusterParam?.split(',') ?? [], [clusterParam]);
};

export default useSelectedRowFilterClusters;
