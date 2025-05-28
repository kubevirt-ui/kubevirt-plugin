import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace, NamespacedResourceMap } from '@kubevirt-utils/resources/shared';
import { vCPUCount } from '@kubevirt-utils/resources/template';
import { getCPU } from '@kubevirt-utils/resources/vm';
import { numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { VMIMapper } from '@virtualmachines/utils/mappers';

export const useCPUFilter = (
  vmiMapper: VMIMapper,
  vmExpandSpecMap: NamespacedResourceMap<V1VirtualMachine>,
): RowFilter<V1VirtualMachine> => ({
  filter: (input, vm) => {
    const cpuInfo = input.selected?.[0];

    if (!cpuInfo) {
      return true;
    }

    const name = getName(vm);
    const namespace = getNamespace(vm);

    const vmi = vmiMapper.mapper?.[namespace]?.[name];
    const vmExpandSpec = vmExpandSpecMap?.[namespace]?.[name];

    const [operator, cpu] = cpuInfo.split(' ');
    const filterCPU = Number(cpu);

    const vmCPU = vCPUCount(getCPU(vmExpandSpec) || getCPU(vm) || getCPU(vmi));

    const compareFunction = numberOperatorInfo[operator].compareFunction;
    return compareFunction(vmCPU, filterCPU);
  },
  filterGroupName: t('vCPU'),
  isMatch: () => true,
  items: [],
  type: VirtualMachineRowFilterType.CPU,
});
