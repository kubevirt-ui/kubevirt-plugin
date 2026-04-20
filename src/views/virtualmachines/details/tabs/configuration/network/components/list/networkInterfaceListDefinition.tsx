import React, { FC, ReactNode } from 'react';
import { TFunction } from 'react-i18next';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import EphemeralBadge from '@kubevirt-utils/components/badges/EphemeralBadge/EphemeralBadge';
import PendingBadge from '@kubevirt-utils/components/badges/PendingBadge/PendingBadge';
import NetworkIcon from '@kubevirt-utils/components/NetworkIcons/NetworkIcon';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getNetworkNameLabel } from '@kubevirt-utils/resources/vm/utils/network/network-columns';
import { Label, Stack, StackItem } from '@patternfly/react-core';

import { SimpleNICPresentation } from '../../utils/types';
import { getConfigInterfaceState, getRuntimeInterfaceState } from '../../utils/utils';

import NetworkInterfaceActions from './NetworkInterfaceActions';

export type NetworkInterfaceListCallbacks = {
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

type NameCellProps = {
  row: SimpleNICPresentation;
};

const NameCell: FC<NameCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  const { interfaceName, isInterfaceEphemeral, isPending, network } = row;
  const nicName = network?.name;
  const isBootable = Boolean(row.config?.iface?.bootOrder);

  return (
    <Stack data-test-id={`nic-${nicName}`}>
      <StackItem>
        {!nicName && interfaceName ? <Label>{interfaceName}</Label> : nicName ?? NO_DATA_DASH}
        {isPending && !isInterfaceEphemeral && <PendingBadge />}
        {isInterfaceEphemeral && <EphemeralBadge />}
      </StackItem>
      {isBootable && (
        <StackItem>
          <Label color="blue" data-test-id={`nic-bootable-${nicName}`} variant="filled">
            {t('bootable')}
          </Label>
        </StackItem>
      )}
    </Stack>
  );
};

type StateCellProps = {
  row: SimpleNICPresentation;
};

const StateCell: FC<StateCellProps> = ({ row }) => {
  const { config, configLinkState, isSRIOV, runtimeLinkState } = row;

  return (
    <NetworkIcon
      configuredState={getConfigInterfaceState(config?.iface, configLinkState, isSRIOV)}
      runtimeState={getRuntimeInterfaceState(runtimeLinkState)}
    />
  );
};

type NetworkCellProps = {
  row: SimpleNICPresentation;
};

const NetworkCell: FC<NetworkCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  return (
    <span data-test-id={`nic-network-${row.network?.name}`}>
      {getNetworkNameLabel(t, { network: row.network }) ?? NO_DATA_DASH}
    </span>
  );
};

const renderActionsCell = (
  row: SimpleNICPresentation,
  callbacks: NetworkInterfaceListCallbacks,
): ReactNode => {
  const { vm } = callbacks;
  const nicName = row.network?.name;
  const nicPresentation = row.config;

  if (!nicName || !nicPresentation) {
    return null;
  }

  return <NetworkInterfaceActions nicName={nicName} nicPresentation={nicPresentation} vm={vm} />;
};

export const getNetworkInterfaceListColumns = (
  t: TFunction,
): ColumnConfig<SimpleNICPresentation, NetworkInterfaceListCallbacks>[] => [
  {
    getValue: (row) => row.network?.name ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row) => <NameCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.iface?.model ?? '',
    key: 'model',
    label: t('Model'),
    renderCell: (row) => (
      <span data-test-id={`nic-model-${row.network?.name}`}>
        {row.iface?.model ?? NO_DATA_DASH}
      </span>
    ),
    sortable: true,
  },
  {
    getValue: (row) => row.network?.multus?.networkName ?? '',
    key: 'network',
    label: t('Network'),
    renderCell: (row) => <NetworkCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.runtimeLinkState ?? '',
    key: 'runtime_link_state',
    label: t('State'),
    renderCell: (row) => <StateCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.type ?? '',
    key: 'type',
    label: t('Type'),
    renderCell: (row) => (
      <span data-test-id={`nic-type-${row.network?.name}`}>{row.type ?? NO_DATA_DASH}</span>
    ),
    sortable: true,
  },
  {
    getValue: (row) => row.iface?.macAddress ?? '',
    key: 'macAddress',
    label: t('MAC address'),
    renderCell: (row) => (
      <span data-test-id={`nic-mac-${row.network?.name}`}>
        {row.iface?.macAddress ?? NO_DATA_DASH}
      </span>
    ),
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: renderActionsCell,
  },
];

export const getNetworkInterfaceRowId = (row: SimpleNICPresentation): string =>
  `${row.network?.name ?? row.interfaceName ?? 'unknown'}-${row.iface?.macAddress ?? 'no-mac'}`;
