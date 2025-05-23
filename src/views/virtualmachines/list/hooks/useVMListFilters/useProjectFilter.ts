import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const useProjectFilter = (): RowFilter<V1VirtualMachine> => ({
  filter: (input, obj) => {
    if (isEmpty(input.selected)) {
      return true;
    }

    return input.selected.some((projectName) => projectName === getNamespace(obj));
  },
  filterGroupName: t('Project'),
  isMatch: () => true,
  items: [],
  type: VirtualMachineRowFilterType.Project,
});
