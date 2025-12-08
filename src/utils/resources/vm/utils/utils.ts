import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getNamespacePathSegment, isEmpty } from '@kubevirt-utils/utils/utils';

export const getVCPUCount = (cpu: V1CPU) =>
  (cpu?.sockets || 1) * (cpu?.cores || 1) * (cpu?.threads || 1);

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
