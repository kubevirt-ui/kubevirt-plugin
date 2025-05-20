import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import {
  isErrorPrintableStatus,
  printableVMStatus,
  VirtualMachineRowFilterType,
} from '@virtualmachines/utils';

const ErrorStatus = { id: 'Error', title: 'Error' };

const statusFilterItems = [
  ...Object.keys(printableVMStatus).map((status) => ({
    id: status,
    title: status,
  })),
  ErrorStatus,
];

export const useStatusFilter = (): RowFilter => ({
  filter: (statuses, obj) => {
    const status = obj?.status?.printableStatus;
    const isError = statuses.selected.includes(ErrorStatus.id) && isErrorPrintableStatus(status);

    return statuses.selected?.length === 0 || statuses.selected?.includes(status) || isError;
  },
  filterGroupName: t('Status'),
  isMatch: (obj, filterStatus) => {
    return (
      filterStatus === obj?.status?.printableStatus ||
      (filterStatus === ErrorStatus.id && isErrorPrintableStatus(obj?.status?.printableStatus))
    );
  },
  items: statusFilterItems,
  type: VirtualMachineRowFilterType.Status,
});
