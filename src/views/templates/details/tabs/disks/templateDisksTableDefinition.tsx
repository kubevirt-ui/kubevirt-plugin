import React, { ReactNode } from 'react';
import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DiskNameCell from '@kubevirt-utils/components/DiskNameCell/DiskNameCell';
import TemplateValue from '@kubevirt-utils/components/TemplateValue/TemplateValue';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';

import DiskRowActions from './components/DiskRowActions';
import TemplateDiskSourceCell from './components/TemplateDiskSourceCell';

export type TemplateDiskCallbacks = {
  actionsDisabled: boolean;
  onUpdate: (vm: V1VirtualMachine) => Promise<void>;
  vm: undefined | V1VirtualMachine;
};

const renderActionsCell = (row: DiskRowDataLayout, callbacks: TemplateDiskCallbacks): ReactNode => {
  if (!callbacks.vm) {
    return null;
  }

  return (
    <DiskRowActions
      diskName={row?.name}
      isDisabled={callbacks.actionsDisabled}
      onUpdate={callbacks.onUpdate}
      vm={callbacks.vm}
    />
  );
};

export const getTemplateDiskColumns = (
  t: TFunction,
): ColumnConfig<DiskRowDataLayout, TemplateDiskCallbacks>[] => [
  {
    getValue: (row) => row?.name ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row) => (
      <DiskNameCell
        wrapper={(children) => (
          <TemplateValue value={row?.name ?? NO_DATA_DASH}>{children}</TemplateValue>
        )}
        row={row}
      />
    ),
    sortable: true,
  },
  {
    getValue: (row) => row?.source ?? '',
    key: 'source',
    label: t('Source'),
    renderCell: (row) => <TemplateDiskSourceCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row?.size ?? '',
    key: 'size',
    label: t('Size'),
    renderCell: (row) => <TemplateValue value={readableSizeUnit(row?.size) ?? NO_DATA_DASH} />,
    sortable: true,
  },
  {
    getValue: (row) => row?.drive ?? '',
    key: 'drive',
    label: t('Drive'),
    renderCell: (row) => <TemplateValue value={row?.drive ?? NO_DATA_DASH} />,
    sortable: true,
  },
  {
    getValue: (row) => row?.interface ?? '',
    key: 'interface',
    label: t('Interface'),
    renderCell: (row) => <TemplateValue value={row?.interface ?? NO_DATA_DASH} />,
    sortable: true,
  },
  {
    getValue: (row) => row?.storageClass ?? '',
    key: 'storage-class',
    label: t('Storage class'),
    renderCell: (row) => <TemplateValue value={row?.storageClass ?? NO_DATA_DASH} />,
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: renderActionsCell,
  },
];

export const getTemplateDiskRowId = (row: DiskRowDataLayout, index: number): string =>
  row?.name ?? `disk-${index}`;
