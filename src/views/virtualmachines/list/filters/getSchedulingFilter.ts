import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getAffinity, getNodeSelector } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { SchedulingKind } from '@search/utils/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const getSchedulingFilter = (t: TFunction): KubevirtFilter<V1VirtualMachine> => ({
  categoryLabel: t('Scheduling'),
  filterLayout: KubevirtFilterLayout.SELECT,
  id: VirtualMachineRowFilterType.Scheduling,
  match: (obj, selected) =>
    (selected.includes(SchedulingKind.AFFINITY_RULES) && !isEmpty(getAffinity(obj))) ||
    (selected.includes(SchedulingKind.NODE_SELECTOR) && !isEmpty(getNodeSelector(obj))),
  options: [
    { label: t('Affinity rules'), value: SchedulingKind.AFFINITY_RULES },
    { label: t('Node selector'), value: SchedulingKind.NODE_SELECTOR },
  ],
});
