import type { ReactNode } from 'react';
import React from 'react';
import type { TFunction } from 'i18next';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import type { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { getName, getNamespace, getUID, getVMStatus } from '@kubevirt-utils/resources/shared';
import type { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import type { Action } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/actions';

import VMActionsCell from './cells/VMActionsCell';
import VMNameCell from './cells/VMNameCell';
import VMNamespaceCell from './cells/VMNamespaceCell';
import VMStatusCell from './cells/VMStatusCell';

export type ConnectedVMsCallbacks = {
  getActions: (vms: V1VirtualMachine[]) => Action[];
  vmNetwork: ClusterUserDefinedNetworkKind;
};

export const getConnectedVMsColumns = (
  t: TFunction,
): ColumnConfig<V1VirtualMachine, ConnectedVMsCallbacks>[] => [
  {
    getValue: (row) => getName(row) ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row): ReactNode => <VMNameCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => getNamespace(row) ?? '',
    key: 'namespace',
    label: t('Namespace'),
    renderCell: (row): ReactNode => <VMNamespaceCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => getVMStatus(row) ?? '',
    key: 'status',
    label: t('Status'),
    renderCell: (row): ReactNode => <VMStatusCell row={row} />,
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: (row, callbacks): ReactNode => (
      <VMActionsCell getActions={callbacks.getActions} row={row} />
    ),
    sortable: false,
  },
];

export const getConnectedVMRowId = (row: V1VirtualMachine, index: number): string =>
  getUID(row) ?? `${getNamespace(row)}-${getName(row)}-${index}`;
