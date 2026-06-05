import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import {
  isErrorPrintableStatus,
  printableVMStatus,
  VirtualMachineRowFilterType,
} from '@virtualmachines/utils';

const ERROR_STATUS_VALUE = 'Error';

export const getStatusFilter = (t: TFunction): KubevirtFilter<V1VirtualMachine> => ({
  categoryLabel: t('Status'),
  filterLayout: KubevirtFilterLayout.SELECT,
  id: VirtualMachineRowFilterType.Status,
  match: (obj, selected) => {
    const status = getVMStatus(obj);
    const isError = selected.includes(ERROR_STATUS_VALUE) && isErrorPrintableStatus(status);
    return selected.includes(status) || isError;
  },
  options: [
    ...Object.keys(printableVMStatus).map((status) => ({
      label: status,
      value: status,
    })),
    { label: t('Error'), value: ERROR_STATUS_VALUE },
  ],
  showAllBadge: true,
});
