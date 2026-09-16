import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getHostname } from '@kubevirt-utils/resources/vm';

export const createURL = (append: string, url: string): string =>
  url?.endsWith('/') ? `${url}${append}` : `${url}/${append}`;

export const getInternalFQDNURL = (vm: V1VirtualMachine): string => {
  const hostname = getHostname(vm);
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- empty string must fall back
  const resolvedHostname = hostname || getName(vm);
  return `${resolvedHostname}.headless.${getNamespace(vm)}.svc.cluster.local`;
};
