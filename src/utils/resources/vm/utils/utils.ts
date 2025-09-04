import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getVMListNamespacesURL, getVMListURL } from '@multicluster/urls';
import { getRowFilterQueryKey } from '@search/utils/query';

export const getVMListPath = (namespace: string, params: string, cluster?: string) => {
  const vmListURL = namespace ? getVMListNamespacesURL(cluster, namespace) : getVMListURL(cluster);
  return `${vmListURL}?${params}`;
};

const getRowFiltersString = (rowFilters: Record<string, string>) =>
  isEmpty(rowFilters)
    ? ''
    : Object.entries(rowFilters)
        .map(([key, value]) => `${getRowFilterQueryKey(key)}=${value}`)
        .join('&');

export const getVMListPathWithRowFilters = (
  namespace: string,
  rowFilters: Record<string, string>,
  cluster?: string,
) => getVMListPath(namespace, getRowFiltersString(rowFilters), cluster);
