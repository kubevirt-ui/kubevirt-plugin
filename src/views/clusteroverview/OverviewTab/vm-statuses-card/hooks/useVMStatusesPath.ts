import { useMemo } from 'react';

import useQuery from '@kubevirt-utils/hooks/useQuery';
import { VM_STATUS } from '@kubevirt-utils/resources/vm';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { getACMVMListURL, getVMListURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { STATUS_LIST_FILTER_PARAM } from '@virtualmachines/utils';

import { ERROR } from '../utils/constants';

const useVMStatusesPath = (namespace: string, statusArray: (typeof ERROR | VM_STATUS)[]) => {
  const query = useQuery();
  const cluster = useClusterParam();
  const isACMPage = useIsACMPage();

  return useMemo(() => {
    const status = statusArray.join(',');
    const newQuery = new URLSearchParams(query);
    newQuery.set(STATUS_LIST_FILTER_PARAM, status);

    const path = isACMPage ? getACMVMListURL(cluster, namespace) : getVMListURL(null, namespace);

    return `${path}?${newQuery.toString()}`;
  }, [query, statusArray, isACMPage, cluster, namespace]);
};

export default useVMStatusesPath;
