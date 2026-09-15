// Extracted from virtualMachinesDefinition.tsx
// Root: src/views/virtualmachines/list/virtualMachinesDefinition.tsx

import { type ReactNode } from 'react';
import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';

import VMClusterCell from './cells/VMClusterCell';
import VMNameCell from './cells/VMNameCell';
import VMNamespaceCell from './cells/VMNamespaceCell';
import VMSelectionCell from './cells/VMSelectionCell';
import { VM_COLUMN_KEYS, type VMColumn } from './vmColumnTypes';

export const getSelectionColumns = (hideActions: boolean): VMColumn[] =>
  hideActions
    ? []
    : [
        {
          getValue: (): string => '',
          key: VM_COLUMN_KEYS.selection,
          label: '',
          props: { className: 'pf-v6-c-table__check' },
          renderCell: (row: V1VirtualMachine): ReactNode => <VMSelectionCell row={row} />,
        },
      ];

export const getNameColumn = (t: TFunction): VMColumn => ({
  getValue: (row: V1VirtualMachine): string => getName(row) ?? '',
  key: VM_COLUMN_KEYS.name,
  label: t('Name'),
  props: { className: 'pf-m-width-20' },
  renderCell: (row: V1VirtualMachine): ReactNode => <VMNameCell row={row} />,
  sortable: true,
});

export const getClusterColumns = (t: TFunction, isAllClustersPage: boolean): VMColumn[] =>
  isAllClustersPage
    ? [
        {
          getValue: (row: V1VirtualMachine): string => getCluster(row) ?? '',
          key: VM_COLUMN_KEYS.cluster,
          label: t('Cluster'),
          renderCell: (row: V1VirtualMachine): ReactNode => <VMClusterCell row={row} />,
          sortable: true,
        },
      ]
    : [];

export const getNamespaceColumns = (t: TFunction, namespace: string): VMColumn[] =>
  namespace
    ? []
    : [
        {
          getValue: (row: V1VirtualMachine): string => getNamespace(row) ?? '',
          key: VM_COLUMN_KEYS.namespace,
          label: t('Namespace'),
          renderCell: (row: V1VirtualMachine): ReactNode => <VMNamespaceCell row={row} />,
          sortable: true,
        },
      ];
