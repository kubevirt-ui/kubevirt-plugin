import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { getNamespacePathSegment, isEmpty } from '@kubevirt-utils/utils/utils';

export const getVMListPath = (namespace: string, params: string) => {
  const namespaceSegment = getNamespacePathSegment(namespace);
  return `/k8s/${namespaceSegment}/${VirtualMachineModelRef}?${params}`;
};

const getRowFiltersString = (rowFilters: Record<string, string>) =>
  isEmpty(rowFilters)
    ? ''
    : Object.entries(rowFilters)
        .map(([key, value]) => `rowFilter-${key}=${value}`)
        .join('&');

export const getVMListPathWithRowFilters = (
  namespace: string,
  rowFilters: Record<string, string>,
) => getVMListPath(namespace, getRowFiltersString(rowFilters));
