import { useSearchParams } from 'react-router';

import { CLUSTER_LIST_FILTER_PARAM } from '@kubevirt-utils/utils/constants';

const useSelectedRowFilterClusters = (
  filterParam: string = CLUSTER_LIST_FILTER_PARAM,
): string[] => {
  const [searchParams] = useSearchParams();
  return searchParams.getAll(filterParam);
};

export default useSelectedRowFilterClusters;
