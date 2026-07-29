import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

export const getGroupFilter = (t: TFunction): KubevirtFilter<V1VirtualMachine> => ({
  categoryLabel: t('Group'),
  filterLayout: KubevirtFilterLayout.HIDDEN,
  id: VirtualMachineRowFilterType.Group,
  match: (obj, selected) => {
    const folder = getLabel(obj, VM_FOLDER_LABEL);
    return selected.includes(folder);
  },
});
