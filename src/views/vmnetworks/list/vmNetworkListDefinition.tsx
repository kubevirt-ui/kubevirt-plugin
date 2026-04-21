import React, { FC, ReactNode } from 'react';
import { Link } from 'react-router';
import { TFunction } from 'i18next';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getUID } from '@kubevirt-utils/resources/shared';
import { getLocalnet, getMTU, getVLANID } from '@kubevirt-utils/resources/udn/selectors';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import VMNetworkActions from '../actions/VMNetworkActions';
import { VM_NETWORKS_PATH } from '../constants';

import MatchedProjects from './components/MatchedProjects';

type MTUCellProps = {
  obj: ClusterUserDefinedNetworkKind;
};

const MTUCell: FC<MTUCellProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();
  const mtu = getMTU(obj);

  if (mtu) {
    return <span data-test-id={`vmnetwork-mtu-${getName(obj)}`}>{mtu}</span>;
  }

  return (
    <span className="pf-v6-u-text-color-subtle" data-test-id={`vmnetwork-mtu-${getName(obj)}`}>
      {t('Not available')}
    </span>
  );
};

const renderActionsCell = (obj: ClusterUserDefinedNetworkKind): ReactNode => (
  <VMNetworkActions obj={obj} />
);

export const getVMNetworkListColumns = (
  t: TFunction,
): ColumnConfig<ClusterUserDefinedNetworkKind>[] => [
  {
    getValue: (row) => getName(row) ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row) => {
      const name = getName(row);
      return (
        <span data-test-id={`vmnetwork-name-${name}`}>
          <Link to={`${VM_NETWORKS_PATH}/${name}`}>{name}</Link>
        </span>
      );
    },
    sortable: true,
  },
  {
    key: 'connected-projects',
    label: t('Connected projects'),
    renderCell: (row) => <MatchedProjects obj={row} />,
  },
  {
    getValue: (row) => getLocalnet(row)?.physicalNetworkName ?? '',
    key: 'physicalNetworkName',
    label: t('Physical network name'),
    renderCell: (row) => (
      <span data-test-id={`vmnetwork-physicalnetwork-${getName(row)}`}>
        {getLocalnet(row)?.physicalNetworkName ?? NO_DATA_DASH}
      </span>
    ),
    sortable: true,
  },
  {
    getValue: (row) => getVLANID(row) ?? 0,
    key: 'vlanID',
    label: t('VLAN ID'),
    renderCell: (row) => (
      <span data-test-id={`vmnetwork-vlanid-${getName(row)}`}>
        {getVLANID(row) ?? NO_DATA_DASH}
      </span>
    ),
    sortable: true,
  },
  {
    getValue: (row) => getMTU(row) ?? 0,
    key: 'mtu',
    label: t('MTU'),
    renderCell: (row) => <MTUCell obj={row} />,
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: renderActionsCell,
  },
];

export const getVMNetworkRowId = (obj: ClusterUserDefinedNetworkKind): string =>
  getUID(obj) ?? getName(obj) ?? 'unknown-vmnetwork';
