import { useSearchParams } from 'react-router-dom-v5-compat';

import { getRowFilterQueryKey } from '@search/utils/query';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils/constants';

const useClustersRowFilters = () => {
  const [searchParams] = useSearchParams();
  const clusters = searchParams.getAll(getRowFilterQueryKey(VirtualMachineRowFilterType.Cluster));

  return clusters;
};

export default useClustersRowFilters;
