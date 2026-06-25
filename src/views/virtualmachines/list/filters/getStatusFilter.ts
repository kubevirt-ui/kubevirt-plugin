import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { ERROR_STATUS } from '@kubevirt-utils/resources/vm';
import {
  isErrorPrintableStatus,
  printableVMStatus,
  STATUS_VALUE_GROUPS,
  VirtualMachineRowFilterType,
} from '@virtualmachines/utils';

export const getStatusFilter = (t: TFunction): KubevirtFilter<V1VirtualMachine> => ({
  categoryLabel: t('Status'),
  filterLayout: KubevirtFilterLayout.SELECT,
  id: VirtualMachineRowFilterType.Status,
  match: (obj, selected) => {
    const status = getVMStatus(obj);
    const isError = selected.includes(ERROR_STATUS) && isErrorPrintableStatus(status);
    return selected.includes(status) || isError;
  },
  optionGroups: [
    { values: STATUS_VALUE_GROUPS[0] },
    { label: t('Starting up'), values: STATUS_VALUE_GROUPS[1] },
    { label: t('Shutting down'), values: STATUS_VALUE_GROUPS[2] },
  ],
  options: [
    ...Object.keys(printableVMStatus).map((status) => ({
      label: status,
      value: status,
    })),
    { label: t('Error'), value: ERROR_STATUS },
  ],
  showAllBadge: true,
});
