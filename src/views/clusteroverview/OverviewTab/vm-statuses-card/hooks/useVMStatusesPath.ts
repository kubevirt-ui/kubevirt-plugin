import { useMemo } from 'react';

import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { VM_STATUS } from '@kubevirt-utils/resources/vm';
import { CLUSTER_LIST_FILTER_PARAM } from '@kubevirt-utils/utils/constants';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import { getACMVMListURL, getVMListURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { STATUS_LIST_FILTER_PARAM } from '@virtualmachines/utils';

import { ERROR } from '../utils/constants';

const useVMStatusesPath = (
  namespace: string,
  statusArray: (typeof ERROR | VM_STATUS)[],
  enabledClusters?: string[],
): string => {
  const query = useQuery();
  const cluster = useActiveClusterParam();
  const isACMPage = useIsACMPage();

  return useMemo(() => {
    const status = statusArray.join(',');
    const newQuery = new URLSearchParams(query);
    newQuery.set(STATUS_LIST_FILTER_PARAM, status);

    // Add cluster filter when viewing all clusters and some clusters are disabled
    if (isACMPage && cluster === ALL_CLUSTERS_KEY && enabledClusters?.length) {
      newQuery.set(CLUSTER_LIST_FILTER_PARAM, enabledClusters.join(','));
    }

    const path = isACMPage ? getACMVMListURL(cluster, namespace) : getVMListURL(null, namespace);

    return `${path}?${newQuery.toString()}`;
  }, [query, statusArray, isACMPage, cluster, namespace, enabledClusters]);
};

export default useVMStatusesPath;
