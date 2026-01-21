import { useMemo } from 'react';

import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { getVMListQueries } from '@virtualmachines/list/hooks/constants';

import useClusterParam from './useClusterParam';
import useIsAllClustersPage from './useIsAllClustersPage';

const useVMListQueries = () => {
  const cluster = useClusterParam();
  const namespace = useNamespaceParam();
  const isAllClustersPage = useIsAllClustersPage();

  const queries = useMemo(
    () => getVMListQueries(namespace, isAllClustersPage ? undefined : cluster),
    [namespace, cluster, isAllClustersPage],
  );

  return queries;
};

export default useVMListQueries;
