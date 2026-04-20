import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getAffinity, getNodeSelector } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { SchedulingKind } from '@search/utils/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const getSchedulingFilter = (t: TFunction): RowFilter<V1VirtualMachine> => ({
  filter: (input, vm) =>
    isEmpty(input.selected) ||
    (input.selected?.includes(SchedulingKind.AFFINITY_RULES) && !isEmpty(getAffinity(vm))) ||
    (input.selected?.includes(SchedulingKind.NODE_SELECTOR) && !isEmpty(getNodeSelector(vm))),
  filterGroupName: t('Scheduling'),
  isMatch: () => true,
  items: [
    { id: SchedulingKind.AFFINITY_RULES, title: t('Affinity rules') },
    { id: SchedulingKind.NODE_SELECTOR, title: t('Node selector') },
  ],
  type: VirtualMachineRowFilterType.Scheduling,
});
