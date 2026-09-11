import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  type KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getInstanceTypeCPU } from '@kubevirt-utils/resources/instancetype/selectors';
import { vCPUCount } from '@kubevirt-utils/resources/template';
import { getCPU } from '@kubevirt-utils/resources/vm';
import { numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import {
  getInstanceTypeFromMapper,
  getVMIFromMapper,
  type InstanceTypeMapper,
  type VMIMapper,
} from '@virtualmachines/utils/mappers';

import { getOperatorChipLabel } from './utils';

export const getCPUFilter = (
  t: TFunction,
  vmiMapper: VMIMapper,
  instanceTypeMapper: InstanceTypeMapper,
): KubevirtFilter<V1VirtualMachine> => ({
  categoryLabel: t('vCPU'),
  filterLayout: KubevirtFilterLayout.HIDDEN,
  getChipLabel: getOperatorChipLabel,
  id: VirtualMachineRowFilterType.CPU,
  match: (obj, selected): boolean => {
    const cpuInfo = selected[0];
    if (!cpuInfo) return true;

    const vmi = getVMIFromMapper(vmiMapper, obj);
    const [operator, cpu] = cpuInfo.split(' ');
    const filterCPU = Number(cpu);

    const cpuSpec = getCPU(obj) ?? getCPU(vmi);
    const vmCPU = cpuSpec
      ? vCPUCount(cpuSpec)
      : getInstanceTypeCPU(getInstanceTypeFromMapper(instanceTypeMapper, obj));

    return numberOperatorInfo[operator].compareFunction(vmCPU, filterCPU);
  },
});
