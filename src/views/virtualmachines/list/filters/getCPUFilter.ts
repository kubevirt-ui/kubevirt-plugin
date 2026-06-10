import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { vCPUCount } from '@kubevirt-utils/resources/template';
import { getCPU } from '@kubevirt-utils/resources/vm';
import { numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { getVMIFromMapper, VMIMapper } from '@virtualmachines/utils/mappers';

import { getOperatorChipLabel } from './utils';

export const getCPUFilter = (
  t: TFunction,
  vmiMapper: VMIMapper,
): KubevirtFilter<V1VirtualMachine> => ({
  categoryLabel: t('vCPU'),
  filterLayout: KubevirtFilterLayout.HIDDEN,
  getChipLabel: getOperatorChipLabel,
  id: VirtualMachineRowFilterType.CPU,
  match: (obj, selected) => {
    const cpuInfo = selected[0];
    if (!cpuInfo) return true;

    const vmi = getVMIFromMapper(vmiMapper, obj);
    const [operator, cpu] = cpuInfo.split(' ');
    const filterCPU = Number(cpu);
    const vmCPU = vCPUCount(getCPU(obj) || getCPU(vmi));
    return numberOperatorInfo[operator].compareFunction(vmCPU, filterCPU);
  },
});
