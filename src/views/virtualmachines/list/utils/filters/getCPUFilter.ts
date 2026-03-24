import { TFunction } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { vCPUCount } from '@kubevirt-utils/resources/template';
import { getCPU } from '@kubevirt-utils/resources/vm';
import { numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { getVMIFromMapper, VMIMapper } from '@virtualmachines/utils/mappers';

export const getCPUFilter = (t: TFunction, vmiMapper: VMIMapper): RowFilter<V1VirtualMachine> => ({
  filter: (input, obj) => {
    const cpuInfo = input.selected?.[0];

    if (!cpuInfo) {
      return true;
    }

    const vmi = getVMIFromMapper(vmiMapper, obj);

    const [operator, cpu] = cpuInfo.split(' ');
    const filterCPU = Number(cpu);

    const vmCPU = vCPUCount(getCPU(obj) || getCPU(vmi));

    const compareFunction = numberOperatorInfo[operator].compareFunction;
    return compareFunction(vmCPU, filterCPU);
  },
  filterGroupName: t('vCPU'),
  isMatch: () => true,
  items: [],
  type: VirtualMachineRowFilterType.CPU,
});
