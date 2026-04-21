import React, { FC, ReactNode } from 'react';
import { TFunction } from 'i18next';

import { VirtualMachineSnapshotModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1VirtualMachineRestore,
  V1beta1VirtualMachineSnapshot,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';

import { snapshotStatuses } from '../../utils/consts';
import IndicationLabelList from '../IndicationLabel/IndicationLabelList';
import SnapshotStatusIcon from '../SnapshotStatusIcon/SnapshotStatusIcon';

import SnapshotActionsMenu from './SnapshotActionsMenu';

export type SnapshotListCallbacks = {
  isVMRunning: boolean;
  restores: Record<string, V1beta1VirtualMachineRestore>;
};

type SnapshotCellProps = {
  callbacks?: SnapshotListCallbacks;
  row: V1beta1VirtualMachineSnapshot;
};

const NameCell: FC<SnapshotCellProps> = ({ row }) => {
  const name = getName(row);
  return (
    <span data-test-id={`snapshot-${name}`}>
      <MulticlusterResourceLink
        cluster={getCluster(row)}
        groupVersionKind={VirtualMachineSnapshotModelGroupVersionKind}
        name={name}
        namespace={getNamespace(row)}
      />
    </span>
  );
};

const CreatedCell: FC<SnapshotCellProps> = ({ row }) => (
  <span data-test-id={`snapshot-created-${getName(row)}`}>
    <Timestamp timestamp={row?.metadata?.creationTimestamp} />
  </span>
);

const StatusCell: FC<SnapshotCellProps> = ({ row }) => (
  <span data-test-id={`snapshot-status-${getName(row)}`}>
    <SnapshotStatusIcon phase={row?.status?.phase} />
  </span>
);

const LastRestoredCell: FC<SnapshotCellProps> = ({ callbacks, row }) => {
  const relevantRestore = callbacks?.restores?.[getName(row)];
  return <Timestamp timestamp={relevantRestore?.status?.restoreTime} />;
};

const renderActionsCell = (
  row: V1beta1VirtualMachineSnapshot,
  callbacks: SnapshotListCallbacks,
): ReactNode => {
  const isRestoreDisabled =
    callbacks.isVMRunning || row?.status?.phase !== snapshotStatuses.Succeeded;
  const isCloneDisabled = !row?.status?.readyToUse;

  return (
    <SnapshotActionsMenu
      isCloneDisabled={isCloneDisabled}
      isRestoreDisabled={isRestoreDisabled}
      snapshot={row}
    />
  );
};

export const getSnapshotListColumns = (
  t: TFunction,
): ColumnConfig<V1beta1VirtualMachineSnapshot, SnapshotListCallbacks>[] => [
  {
    getValue: (row) => getName(row) ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row) => <NameCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => new Date(row?.metadata?.creationTimestamp ?? 0).getTime(),
    key: 'created',
    label: t('Created'),
    renderCell: (row) => <CreatedCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row?.status?.phase ?? '',
    key: 'status',
    label: t('Status'),
    renderCell: (row) => <StatusCell row={row} />,
    sortable: true,
  },
  {
    key: 'last-restored',
    label: t('Last restored'),
    renderCell: (row, callbacks) => <LastRestoredCell callbacks={callbacks} row={row} />,
  },
  {
    key: 'indications',
    label: t('Indications'),
    renderCell: (row) => <IndicationLabelList snapshot={row} />,
  },
  {
    key: 'actions',
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: renderActionsCell,
  },
];

export const getSnapshotRowId = (row: V1beta1VirtualMachineSnapshot): string =>
  getUID(row) ?? getName(row) ?? 'unknown-snapshot';
