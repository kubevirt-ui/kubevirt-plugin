import { type ReactNode } from 'react';
import { type TFunction } from 'i18next';

import { type V1Condition } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

const renderTimestamp = (condition: V1Condition): ReactNode => (
  <Timestamp timestamp={condition.lastTransitionTime} />
);

export const getConditionsColumns = (t: TFunction): ColumnConfig<V1Condition, undefined>[] => [
  {
    getValue: (row) => row.type ?? '',
    key: 'type',
    label: t('Type'),
    renderCell: (row) => row.type,
    sortable: true,
  },
  {
    getValue: (row) => row.status ?? '',
    key: 'status',
    label: t('Status'),
    renderCell: (row) => row.status,
    sortable: true,
  },
  {
    getValue: (row) => row.lastTransitionTime ?? '',
    key: 'lastTransitionTime',
    label: t('Updated'),
    renderCell: renderTimestamp,
    sortable: true,
  },
  {
    getValue: (row) => row.reason ?? '',
    key: 'reason',
    label: t('Reason'),
    renderCell: (row) => row.reason ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    key: 'message',
    label: t('Message'),
    renderCell: (row) => row.message ?? NO_DATA_DASH,
  },
];

export const getConditionRowId = (condition: V1Condition, index: number): string =>
  `${condition.type}-${index}`;
