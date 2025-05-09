import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMIIPAddresses } from '@kubevirt-utils/resources/vmi';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { compareCIDR, VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { VMIMapper } from '@virtualmachines/utils/mappers';

export const useIPSearchFilter = (vmiMapper: VMIMapper): RowFilter => ({
  filter: (input, obj) => {
    const search = input.selected?.[0];

    if (!search) return true;

    const vmi = vmiMapper.mapper?.[obj?.metadata?.namespace]?.[obj?.metadata?.name];

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
