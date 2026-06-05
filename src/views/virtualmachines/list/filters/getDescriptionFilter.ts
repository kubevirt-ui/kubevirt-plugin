import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { fuzzyCaseInsensitive } from '@kubevirt-utils/components/ListPageFilter/utils';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getDescription } from '@kubevirt-utils/resources/shared';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const getDescriptionFilter = (t: TFunction): KubevirtFilter<V1VirtualMachine> => ({
  categoryLabel: t('Description'),
  filterLayout: KubevirtFilterLayout.HIDDEN,
  id: VirtualMachineRowFilterType.Description,
  match: (obj, selected) => {
    const search = selected[0];
    if (!search) return true;
    return fuzzyCaseInsensitive(search, getDescription(obj) ?? '');
  },
});
