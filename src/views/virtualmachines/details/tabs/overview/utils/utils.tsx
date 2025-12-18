import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getHostname } from '@kubevirt-utils/resources/vm';

export const createURL = (append: string, url: string): string =>
  url?.endsWith('/') ? `${url}${append}` : `${url}/${append}`;

export const getInternalFQDNURL = (vm: V1VirtualMachine): string => {
  return `${getHostname(vm) || getName(vm)}.headless.${getNamespace(vm)}.svc.cluster.local`;
};
