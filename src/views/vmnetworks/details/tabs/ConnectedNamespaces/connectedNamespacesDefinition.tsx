import React, { ReactNode } from 'react';
import { TFunction } from 'i18next';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';

import { NamespaceWithVMCount } from '../../types';

import NamespaceVMCountCell from './cells/NamespaceVMCountCell';
import NamespaceNameCell from './cells/NamespaceNameCell';

export const getConnectedNamespacesColumns = (t: TFunction): ColumnConfig<NamespaceWithVMCount>[] => [
  {
    getValue: (row) => row.namespaceName ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row): ReactNode => <NamespaceNameCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.vmCount,
    key: 'connected-vms',
    label: t('Connected virtual machines'),
    renderCell: (row): ReactNode => <NamespaceVMCountCell row={row} />,
    sortable: true,
  },
];

export const getConnectedNamespaceRowId = (row: NamespaceWithVMCount, index: number): string =>
  row.namespaceName || `unknown-namespace-${index}`;
