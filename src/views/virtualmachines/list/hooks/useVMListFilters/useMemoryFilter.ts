import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace, NamespacedResourceMap } from '@kubevirt-utils/resources/shared';
import { getMemory } from '@kubevirt-utils/resources/vm';
import { numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { convertToBaseValue } from '@kubevirt-utils/utils/humanize.js';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { VMIMapper } from '@virtualmachines/utils/mappers';

export const useMemoryFilter = (
  vmiMapper: VMIMapper,
  vmExpandSpecMap: NamespacedResourceMap<V1VirtualMachine>,
): RowFilter<V1VirtualMachine> => ({
  filter: (input, vm) => {
    const memoryInfo = input.selected?.[0];

    if (!memoryInfo) {
      return true;
    }

    const name = getName(vm);
    const namespace = getNamespace(vm);

    const vmi = vmiMapper.mapper?.[namespace]?.[name];
    const vmExpandSpec = vmExpandSpecMap?.[namespace]?.[name];

    const [operator, memoryFilterValue, memoryFilterUnit] = memoryInfo.split(' ');

    const filterBytes = convertToBaseValue(`${memoryFilterValue} ${memoryFilterUnit.slice(0, -1)}`);

    const vmMemory = getMemory(vmExpandSpec) || getMemory(vm) || getMemory(vmi);
    const vmBytes = convertToBaseValue(vmMemory);

    const compareFunction = numberOperatorInfo[operator].compareFunction;
    return compareFunction(vmBytes, filterBytes);
  },
  filterGroupName: t('Memory'),
  isMatch: () => true,
  items: [],
  type: VirtualMachineRowFilterType.Memory,
});
