import { V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isAllNamespaces, isEmpty } from '@kubevirt-utils/utils/utils';
import { getACMVMListURL, getVMListNamespacesURL, getVMListURL } from '@multicluster/urls';
import { getRowFilterQueryKey } from '@search/utils/query';

export const getVMListPath = (namespace: string, cluster?: string, params?: string) => {
  const vmListURL = isAllNamespaces(namespace)
    ? getVMListURL(cluster)
    : getVMListNamespacesURL(cluster, namespace);

  if (!params) return vmListURL;

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
) => `${getVMListURL(cluster, namespace)}?${getRowFiltersString(rowFilters)}`;

export const getACMMListPathWithRowFilters = (
  cluster: string,
  namespace: string,
  rowFilters: Record<string, string>,
) => `${getACMVMListURL(cluster, namespace)}?${getRowFiltersString(rowFilters)}`;

export const getVCPUCount = (cpu: V1CPU) =>
  (cpu?.sockets || 1) * (cpu?.cores || 1) * (cpu?.threads || 1);
