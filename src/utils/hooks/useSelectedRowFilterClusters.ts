import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { CLUSTER_LIST_FILTER_PARAM } from '@kubevirt-utils/utils/constants';

const useSelectedRowFilterClusters = (): string[] => {
  const [searchParams] = useSearchParams();
  return useMemo(() => searchParams.get(CLUSTER_LIST_FILTER_PARAM)?.split(','), [searchParams]);
};

export default useSelectedRowFilterClusters;
