import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getMemory } from '@kubevirt-utils/resources/vm';
import { numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { convertToBaseValue } from '@kubevirt-utils/utils/humanize.js';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { VMIMapper } from '@virtualmachines/utils/mappers';

export const getMemoryFilter = (vmiMapper: VMIMapper): RowFilter<V1VirtualMachine> => ({
  filter: (input, obj) => {
    const memoryInfo = input.selected?.[0];

    if (!memoryInfo) {
      return true;
    }

    const vmi = vmiMapper.mapper?.[obj?.metadata?.namespace]?.[obj?.metadata?.name];

    const [operator, memoryFilterValue, memoryFilterUnit] = memoryInfo.split(' ');

    const filterBytes = convertToBaseValue(`${memoryFilterValue} ${memoryFilterUnit.slice(0, -1)}`);

    const vmMemory = getMemory(obj) || getMemory(vmi);
    const vmBytes = convertToBaseValue(vmMemory);

    const compareFunction = numberOperatorInfo[operator].compareFunction;
    return compareFunction(vmBytes, filterBytes);
  },
  filterGroupName: t('Memory'),
  isMatch: () => true,
  items: [],
  type: VirtualMachineRowFilterType.Memory,
});
