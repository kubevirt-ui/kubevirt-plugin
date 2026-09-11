import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  type KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getDescription } from '@kubevirt-utils/resources/shared';
import { fuzzyCaseInsensitive } from '@kubevirt-utils/utils/utils';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const getDescriptionFilter = (t: TFunction): KubevirtFilter<V1VirtualMachine> => ({
  categoryLabel: t('Description'),
  filterLayout: KubevirtFilterLayout.HIDDEN,
  id: VirtualMachineRowFilterType.Description,
  match: (obj, selected): boolean => {
    const search = selected[0];
    if (!search) return true;
    return fuzzyCaseInsensitive(search, getDescription(obj) ?? '');
  },
});
