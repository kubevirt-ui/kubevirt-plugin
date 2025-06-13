import { TFunction } from 'react-i18next';

import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getConfigInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { sortNICs } from '@kubevirt-utils/resources/vm/utils/network/utils';
import { compareWithDirection } from '@kubevirt-utils/utils/utils';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

export const getNetworkNameLabel = <
  T extends { network: { multus?: { networkName: string }; pod?: unknown } },
>(
  t: TFunction,
  nic: T,
) => (nic?.network?.pod ? t('Pod networking') : nic?.network?.multus?.networkName);

export const isSRIOVNetwork = <T extends { sriov?: object }>(iface: T) => !!iface?.sriov;

export const Name = <T extends { network: { name: string } }>(t: TFunction): TableColumn<T> => ({
  id: 'name',
  sort: (data, direction) =>
    data.sort((a, b) => compareWithDirection(direction, a?.network?.name, b?.network?.name)),
  title: t('Name'),
  transforms: [sortable],
});

export const Model = <T extends { iface: { model?: string } }>(t: TFunction): TableColumn<T> => ({
  id: 'model',
  sort: (data, direction) =>
    data.sort((a, b) => compareWithDirection(direction, a?.iface?.model, b?.iface?.model)),
  title: t('Model'),
  transforms: [sortable],
});

export const Network = <T extends { network: { multus?: { networkName: string }; pod?: unknown } }>(
  t: TFunction,
): TableColumn<T> => ({
  id: 'network',
  sort: (data, direction) =>
    data.sort((a, b) =>
      compareWithDirection(direction, getNetworkNameLabel<T>(t, a), getNetworkNameLabel<T>(t, b)),
    ),
  title: t('Network'),
  transforms: [sortable],
});

export const State = <T extends { iface: { sriov?: object; state?: string } }>(
  t: TFunction,
): TableColumn<T> => ({
  id: 'state',
  sort: (data, direction) =>
    data.sort((a, b) =>
      compareWithDirection(
        direction,
        getConfigInterfaceState(a?.iface, a?.iface?.state, isSRIOVNetwork(a?.iface)),
        getConfigInterfaceState(b?.iface, b?.iface?.state, isSRIOVNetwork(b?.iface)),
      ),
    ),
  title: t('State'),
  transforms: [sortable],
});

export const Type = (t: TFunction): TableColumn<NetworkPresentation> => ({
  id: 'type',
  sort: sortNICs,
  title: t('Type'),
  transforms: [sortable],
});

export const MacAddress = <T extends { iface: { macAddress?: string } }>(
  t: TFunction,
): TableColumn<T> => ({
  id: 'macAddress',
  sort: (data, direction) =>
    data.sort((a, b) =>
      compareWithDirection(direction, a?.iface?.macAddress, b?.iface?.macAddress),
    ),
  title: t('MAC address'),
  transforms: [sortable],
});

export const Actions = {
  id: '',
  props: { className: 'pf-v6-c-table__action' },
  title: '',
};
