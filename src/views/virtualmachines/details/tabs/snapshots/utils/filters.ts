import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { snapshotStatuses } from './consts';

export const filters: RowFilter[] = [
  {
    filter: (statuses, obj) => {
      const status = obj?.status?.phase;
      return (
        statuses.selected?.length === 0 ||
        statuses.selected?.includes(status) ||
        !statuses?.all?.find((item) => item === status)
      );
    },
    filterGroupName: 'Status',
    items: Object.keys(snapshotStatuses).map((status) => ({
      id: snapshotStatuses[status],
      title: snapshotStatuses[status],
    })),
    reducer: (obj) => obj?.status?.phase,
    type: 'status-phase',
  },
];
