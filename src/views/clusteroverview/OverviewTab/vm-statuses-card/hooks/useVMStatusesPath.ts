import { useMemo } from 'react';

import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { VM_STATUS } from '@kubevirt-utils/resources/vm';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import { getACMVMListURL, getVMListURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { VM_LIST_TAB_PARAM, VM_LIST_TAB_VMS } from '@virtualmachines/navigator/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

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
    const newQuery = new URLSearchParams(query);
    newQuery.delete(VirtualMachineRowFilterType.Status);
    statusArray.forEach((s) => newQuery.append(VirtualMachineRowFilterType.Status, s));
    newQuery.set(VM_LIST_TAB_PARAM, VM_LIST_TAB_VMS);

    // Add cluster filter when viewing all clusters and some clusters are disabled
    if (isACMPage && cluster === ALL_CLUSTERS_KEY && enabledClusters?.length) {
      enabledClusters.forEach((c) => newQuery.append(VirtualMachineRowFilterType.Cluster, c));
    }

    const path = isACMPage ? getACMVMListURL(cluster, namespace) : getVMListURL(null, namespace);

    return `${path}?${newQuery.toString()}`;
  }, [query, statusArray, isACMPage, cluster, namespace, enabledClusters]);
};

export default useVMStatusesPath;
