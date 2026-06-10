import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getMemory } from '@kubevirt-utils/resources/vm';
import { numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { convertToBaseValue } from '@kubevirt-utils/utils/humanize.js';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { getVMIFromMapper, VMIMapper } from '@virtualmachines/utils/mappers';

import { getOperatorChipLabel } from './utils';

export const getMemoryFilter = (
  t: TFunction,
  vmiMapper: VMIMapper,
): KubevirtFilter<V1VirtualMachine> => ({
  categoryLabel: t('Memory'),
  filterLayout: KubevirtFilterLayout.HIDDEN,
  getChipLabel: getOperatorChipLabel,
  id: VirtualMachineRowFilterType.Memory,
  match: (obj, selected) => {
    const memoryInfo = selected[0];
    if (!memoryInfo) return true;

    const vmi = getVMIFromMapper(vmiMapper, obj);
    const [operator, memoryFilterValue, memoryFilterUnit] = memoryInfo.split(' ');
    const filterBytes = convertToBaseValue(`${memoryFilterValue} ${memoryFilterUnit.slice(0, -1)}`);
    const vmMemory = getMemory(obj) || getMemory(vmi);
    const vmBytes = convertToBaseValue(vmMemory);
    return numberOperatorInfo[operator].compareFunction(vmBytes, filterBytes);
  },
});
