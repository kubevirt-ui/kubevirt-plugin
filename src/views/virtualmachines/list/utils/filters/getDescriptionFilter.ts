import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const getDescriptionFilter = (): RowFilter<V1VirtualMachine> => ({
  filter: (input, obj) => {
    const search = input.selected?.[0];

    if (!search) return true;

    return obj.metadata?.annotations?.description?.toLowerCase().includes(search.toLowerCase());
  },
  filterGroupName: t('Description'),
  isMatch: () => true,
  items: [],
  type: VirtualMachineRowFilterType.Description,
});
