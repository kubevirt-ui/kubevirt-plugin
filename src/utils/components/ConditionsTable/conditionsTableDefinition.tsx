import React, { ReactNode } from 'react';
import { TFunction } from 'i18next';

import { V1Condition } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

const renderTimestamp = (condition: V1Condition): ReactNode => (
  <Timestamp timestamp={condition.lastTransitionTime} />
);

export const getConditionsColumns = (t: TFunction): ColumnConfig<V1Condition, undefined>[] => [
  {
    getValue: (r) => r.type ?? '',
    key: 'type',
    label: t('Type'),
    renderCell: (r) => r.type,
    sortable: true,
  },
  {
    getValue: (r) => r.status ?? '',
    key: 'status',
    label: t('Status'),
    renderCell: (r) => r.status,
    sortable: true,
  },
  {
    getValue: (r) => r.lastTransitionTime ?? '',
    key: 'lastTransitionTime',
    label: t('Updated'),
    renderCell: renderTimestamp,
    sortable: true,
  },
  {
    getValue: (r) => r.reason ?? '',
    key: 'reason',
    label: t('Reason'),
    renderCell: (r) => r.reason ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    key: 'message',
    label: t('Message'),
    renderCell: (r) => r.message ?? NO_DATA_DASH,
  },
];

export const getConditionRowId = (condition: V1Condition, index: number): string =>
  `${condition.type}-${index}`;
