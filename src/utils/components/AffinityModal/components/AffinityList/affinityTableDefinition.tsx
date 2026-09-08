import React, { type ReactNode } from 'react';
import { type TFunction } from 'i18next';

import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { type AffinityRowData } from '../../utils/types';
import AffinityRowActionsDropdown from './components/AffinityRowActionsDropdown';
import { AFFINITY_CONDITION_LABELS, AFFINITY_TYPE_LABLES } from './utils/constants';

export type AffinityCallbacks = {
  onDelete: (affinity: AffinityRowData) => void;
  onEdit: (affinity: AffinityRowData) => void;
  t: TFunction;
};

const renderAffinityTerms = (affinity: AffinityRowData, { t }: AffinityCallbacks): ReactNode => {
  const expressionsCount = affinity.expressions?.length ?? 0;
  const fieldsCount = affinity.fields?.length ?? 0;

  if (expressionsCount === 0 && fieldsCount === 0) {
    return NO_DATA_DASH;
  }

  const expressionsLabel =
    expressionsCount > 0 && t('{{count}} Expression', { count: expressionsCount });
  const fieldsLabel = fieldsCount > 0 && t('{{count}} Node Field', { count: fieldsCount });
  return (
    <>
      <div>{expressionsLabel}</div>
      <div>{fieldsLabel}</div>
    </>
  );
};

const renderAffinityActions = (
  affinity: AffinityRowData,
  { onDelete, onEdit }: AffinityCallbacks,
): ReactNode => (
  <AffinityRowActionsDropdown affinity={affinity} onDelete={onDelete} onEdit={onEdit} />
);

export const getAffinityColumns = (
  t: TFunction,
): ColumnConfig<AffinityRowData, AffinityCallbacks>[] => [
  {
    getValue: (row) => AFFINITY_TYPE_LABLES[row.type] ?? '',
    key: 'type',
    label: t('Type'),
    renderCell: (row) => AFFINITY_TYPE_LABLES[row.type],
    sortable: true,
  },
  {
    getValue: (row) => AFFINITY_CONDITION_LABELS[row.condition] ?? '',
    key: 'condition',
    label: t('Condition'),
    renderCell: (row) => AFFINITY_CONDITION_LABELS[row.condition],
    sortable: true,
  },
  {
    getValue: (row) => row.weight ?? 0,
    key: 'weight',
    label: t('Weight'),
    renderCell: (row) => row.weight ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    key: 'terms',
    label: t('Terms'),
    renderCell: renderAffinityTerms,
  },
  {
    key: 'actions',
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: renderAffinityActions,
  },
];

export const getAffinityRowId = (affinity: AffinityRowData, index: number): string =>
  `${affinity.type}-${affinity.condition}-${index}`;
