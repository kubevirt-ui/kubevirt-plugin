import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vCPUCount } from '@kubevirt-utils/resources/template';
import { getCPU } from '@kubevirt-utils/resources/vm';
import { numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { VMIMapper } from '@virtualmachines/utils/mappers';

export const useCPUFilter = (vmiMapper: VMIMapper): RowFilter => ({
  filter: (input, obj) => {
    const cpuInfo = input.selected?.[0];

    if (!cpuInfo) {
      return true;
    }

    const vmi = vmiMapper.mapper?.[obj?.metadata?.namespace]?.[obj?.metadata?.name];

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
