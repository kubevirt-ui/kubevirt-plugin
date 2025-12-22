import { useMemo } from 'react';

import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import useListNamespaces from '@kubevirt-utils/hooks/useListNamespaces';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { getVMListQueries } from '@virtualmachines/list/hooks/utils';

const useVMListQueries = () => {
  const clusters = useListClusters();
  const namespaces = useListNamespaces();

  const [hubClusterName] = useHubClusterName();

  const clustersForQueries = useMemo(
    () => (clusters.length === 1 && clusters[0] === hubClusterName ? [] : clusters),
    [clusters, hubClusterName],
  );

  const queries = useMemo(
    () => getVMListQueries(namespaces, clustersForQueries),
    [namespaces, clustersForQueries],
  );

  return queries;
};

export default useVMListQueries;
