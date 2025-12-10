import { useMemo } from 'react';

import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import useListNamespaces from '@kubevirt-utils/hooks/useListNamespaces';
import { getVMListQueries } from '@virtualmachines/list/hooks/utils';

import useIsAllClustersPage from './useIsAllClustersPage';

const useVMListQueries = () => {
  const clusters = useListClusters();
  const namespaces = useListNamespaces();

  const isAllClustersPage = useIsAllClustersPage();

  const queries = useMemo(
    () => getVMListQueries(namespaces, clusters, isAllClustersPage),
    [namespaces, clusters, isAllClustersPage],
  );

  return queries;
};

export default useVMListQueries;
