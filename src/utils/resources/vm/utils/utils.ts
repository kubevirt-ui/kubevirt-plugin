import { V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isAllNamespaces, isEmpty } from '@kubevirt-utils/utils/utils';
import { getACMVMListURL, getVMListNamespacesURL, getVMListURL } from '@multicluster/urls';

export const getVMListPath = (namespace: string, cluster?: string, params?: string): string => {
  const vmListURL = isAllNamespaces(namespace)
    ? getVMListURL(cluster)
    : getVMListNamespacesURL(cluster, namespace);

  if (!params) return vmListURL;

  return `${vmListURL}?${params}`;
};

type FilterQueryValue = string | string[];

const getFiltersQueryString = (filters: Record<string, FilterQueryValue>): string => {
  if (isEmpty(filters)) return '';

  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    (Array.isArray(value) ? value : [value]).forEach((item) => params.append(key, item));
  });

  return params.toString();
};

export const getVMListPathWithFilters = (
  namespace: string,
  filters: Record<string, FilterQueryValue>,
  cluster?: string,
): string => `${getVMListURL(cluster, namespace)}?${getFiltersQueryString(filters)}`;

export const getACMListPathWithFilters = (
  cluster: string,
  namespace: string,
  filters: Record<string, FilterQueryValue>,
): string => `${getACMVMListURL(cluster, namespace)}?${getFiltersQueryString(filters)}`;

export const getVCPUCount = (cpu: V1CPU): number =>
  (cpu?.sockets || 1) * (cpu?.cores || 1) * (cpu?.threads || 1);
