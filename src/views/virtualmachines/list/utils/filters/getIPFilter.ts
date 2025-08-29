import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMIIPAddresses } from '@kubevirt-utils/resources/vmi';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { compareCIDR, VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { getVMIFromMapper, VMIMapper } from '@virtualmachines/utils/mappers';

export const getIPFilter = (vmiMapper: VMIMapper): RowFilter<V1VirtualMachine> => ({
  filter: (input, obj) => {
    const search = input.selected?.[0];

    if (!search) return true;

    const vmi = getVMIFromMapper(vmiMapper, obj);
    const ipAddresses = getVMIIPAddresses(vmi);

    return search.includes('/')
      ? ipAddresses.some((ipAddress) => compareCIDR(search, ipAddress))
      : ipAddresses.some((ipAddress) => ipAddress?.includes(search));
  },
  filterGroupName: t('IP Address'),
  isMatch: () => true,
  items: [],
  type: VirtualMachineRowFilterType.IP,
});
