import { ROW_FILTERS_PREFIX } from '@kubevirt-utils/utils/constants';
import { getACMVMListURL, getVMListURL } from '@multicluster/urls';
import { GuestAgentStatus } from '@virtualmachines/list/utils/filters/getGuestAgentFilter';
import { VM_LIST_TAB_PARAM, VM_LIST_TAB_VMS } from '@virtualmachines/navigator/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const buildGuestAgentNotReportingPath = (
  isACMPage: boolean,
  cluster: string,
  namespace: string,
): string => {
  const params = new URLSearchParams();
  params.set(
    `${ROW_FILTERS_PREFIX}${VirtualMachineRowFilterType.GuestAgent}`,
    GuestAgentStatus.NotReporting,
  );
  params.set(VM_LIST_TAB_PARAM, VM_LIST_TAB_VMS);

  const basePath = isACMPage ? getACMVMListURL(cluster, namespace) : getVMListURL(null, namespace);
  return `${basePath}?${params.toString()}`;
};
