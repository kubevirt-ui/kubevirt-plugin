import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const getDescriptionFilter = (t: TFunction): RowFilter<V1VirtualMachine> => ({
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
