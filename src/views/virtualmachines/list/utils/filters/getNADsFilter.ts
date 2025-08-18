import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getNetworks } from '@kubevirt-utils/resources/vm/utils/selectors';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const getNADsFilter = (): RowFilter<V1VirtualMachine> => ({
  filter: (input, vm) => {
    if (input.selected?.length === 0) {
      return true;
    }

    const networkNames = getNetworks(vm)
      ?.map((network) => network.multus?.networkName)
      .map((networkName) =>
        networkName?.includes('/') ? networkName : `${getNamespace(vm)}/${networkName}`,
      );

    return networkNames?.some((networkName) => input.selected?.includes(networkName));
  },
  filterGroupName: 'NADs',
  isMatch: () => true,
  items: [],
  type: VirtualMachineRowFilterType.NAD,
});
