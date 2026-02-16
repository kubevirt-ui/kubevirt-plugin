import React from 'react';
import { TFunction } from 'react-i18next';

import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort';

import { K8sResourceCondition } from './ConditionsTable';

const renderTimestamp = (condition: K8sResourceCondition): React.ReactNode => (
  <Timestamp timestamp={condition.lastTransitionTime} />
);

export const getConditionsColumns = (
  t: TFunction,
): ColumnConfig<K8sResourceCondition, undefined>[] => [
  {
    getValue: (r) => r.type || '',
    key: 'type',
    label: t('Type'),
    renderCell: (r) => r.type,
    sortable: true,
  },
  {
    getValue: (r) => r.status || '',
    key: 'status',
    label: t('Status'),
    renderCell: (r) => r.status,
    sortable: true,
  },
  {
    getValue: (r) => r.lastTransitionTime || '',
    key: 'lastTransitionTime',
    label: t('Updated'),
    renderCell: renderTimestamp,
    sortable: true,
  },
  {
    getValue: (r) => r.reason || '',
    key: 'reason',
    label: t('Reason'),
    renderCell: (r) => r.reason || '',
    sortable: true,
  },
  {
    key: 'message',
    label: t('Message'),
    renderCell: (r) => r.message || '',
  },
];

export const getConditionRowId = (condition: K8sResourceCondition, index: number): string =>
  `${condition.type}-${index}`;
