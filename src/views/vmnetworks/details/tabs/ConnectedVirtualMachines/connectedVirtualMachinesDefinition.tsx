import React, { FC, ReactNode } from 'react';
import { TFunction } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import {
  modelToGroupVersionKind,
  NamespaceModel,
  VirtualMachineModel,
} from '@kubevirt-utils/models';
import { getName, getNamespace, getUID, getVMStatus } from '@kubevirt-utils/resources/shared';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Action } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/actions';

export type ConnectedVMsCallbacks = {
  getActions: (vms: V1VirtualMachine[]) => Action[];
  vmNetwork: ClusterUserDefinedNetworkKind;
};

const NameCell: FC<{ row: V1VirtualMachine }> = ({ row }) => {
  const name = getName(row);
  const namespace = getNamespace(row);

  if (!name || !namespace) {
    return <span data-test="vm-name">{NO_DATA_DASH}</span>;
  }

  return (
    <span data-test={`vm-name-${name}`}>
      <ResourceLink
        groupVersionKind={modelToGroupVersionKind(VirtualMachineModel)}
        name={name}
        namespace={namespace}
      />
    </span>
  );
};

const NamespaceCell: FC<{ row: V1VirtualMachine }> = ({ row }) => {
  const namespace = getNamespace(row);

  if (!namespace) {
    return <span data-test="vm-namespace">{NO_DATA_DASH}</span>;
  }

  return (
    <span data-test={`vm-namespace-${namespace}`}>
      <ResourceLink groupVersionKind={modelToGroupVersionKind(NamespaceModel)} name={namespace} />
    </span>
  );
};

const StatusCell: FC<{ row: V1VirtualMachine }> = ({ row }) => {
  const status = getVMStatus(row);

  return <span data-test={`vm-status-${getName(row)}`}>{status ?? NO_DATA_DASH}</span>;
};

type ActionsCellProps = {
  callbacks: ConnectedVMsCallbacks;
  row: V1VirtualMachine;
};

const ActionsCell: FC<ActionsCellProps> = ({ callbacks, row }) => {
  const { getActions } = callbacks;
  const actions = getActions([row]);

  return <ActionsDropdown actions={actions} id={`vm-actions-${getName(row)}`} isKebabToggle />;
};

export const getConnectedVMsColumns = (
  t: TFunction,
): ColumnConfig<V1VirtualMachine, ConnectedVMsCallbacks>[] => [
  {
    getValue: (row) => getName(row) ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row): ReactNode => <NameCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => getNamespace(row) ?? '',
    key: 'namespace',
    label: t('Namespace'),
    renderCell: (row): ReactNode => <NamespaceCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => getVMStatus(row) ?? '',
    key: 'status',
    label: t('Status'),
    renderCell: (row): ReactNode => <StatusCell row={row} />,
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: (row, callbacks): ReactNode => <ActionsCell callbacks={callbacks} row={row} />,
    sortable: false,
  },
];

export const getConnectedVMRowId = (row: V1VirtualMachine, index: number): string =>
  getUID(row) ?? `${getNamespace(row)}-${getName(row)}-${index}`;
