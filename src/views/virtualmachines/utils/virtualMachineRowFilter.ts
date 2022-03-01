import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { printableVMStatus } from './virtualMachineStatuses';

export const filters: RowFilter[] = [
  {
    filterGroupName: 'Status',
    type: 'status',
    reducer: (obj) => obj?.status?.printableStatus,
    filter: (statuses, obj) => {
      const status = obj?.status?.printableStatus;
      return (
        statuses.selected?.length === 0 ||
        statuses.selected?.includes(status) ||
        !statuses?.all?.find((s) => s === status)
      );
    },
    items: Object.keys(printableVMStatus).map((status) => ({
      id: status,
      title: status,
    })),
  },
];
