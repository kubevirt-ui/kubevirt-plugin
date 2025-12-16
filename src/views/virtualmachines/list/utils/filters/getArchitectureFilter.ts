import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getArchitecture } from '@kubevirt-utils/resources/vm/utils/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const getArchitectureFilter = (vms: V1VirtualMachine[]): RowFilter<V1VirtualMachine> => ({
  filter: (input, vm) => {
    const selectedArchitectures = input.selected;

    if (isEmpty(selectedArchitectures)) {
      return true;
    }

    return selectedArchitectures.some((architecture) => getArchitecture(vm) === architecture);
  },
  filterGroupName: t('Architecture type'),
  isMatch: (vm, architecture) => getArchitecture(vm) === architecture,
  items: Array.from(
    vms?.reduce((acc, vm) => {
      const architecture = getArchitecture(vm);
      if (architecture) {
        acc.add(architecture);
      }
      return acc;
    }, new Set<string>()),
  ).map((architecture) => ({
    id: architecture,
    title: architecture,
  })),
  type: VirtualMachineRowFilterType.Architecture,
});
