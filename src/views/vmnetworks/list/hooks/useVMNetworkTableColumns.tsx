import React, { useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getLocalnet, getMTU, getVLANID } from '@kubevirt-utils/resources/udn/selectors';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import VMNetworkActions from '../../actions/VMNetworkActions';
import { VM_NETWORKS_PATH } from '../../constants';
import MatchedProjects from '../components/MatchedProjects';

const useVMNetworkTableColumns = (): ColumnConfig<ClusterUserDefinedNetworkKind>[] => {
  const { t } = useKubevirtTranslation();

  return useMemo(
    (): ColumnConfig<ClusterUserDefinedNetworkKind>[] => [
      {
        getValue: (row) => getName(row) ?? '',
        key: 'name',
        label: t('Name'),
        renderCell: (row) => {
          const name = getName(row);
          return <Link to={`${VM_NETWORKS_PATH}/${name}`}>{name}</Link>;
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
        renderCell: (row) => getLocalnet(row)?.physicalNetworkName || NO_DATA_DASH,
        sortable: true,
      },
      {
        getValue: (row) => String(getVLANID(row) ?? ''),
        key: 'vlanID',
        label: t('VLAN ID'),
        renderCell: (row) => getVLANID(row) ?? NO_DATA_DASH,
        sortable: true,
      },
      {
        getValue: (row) => getMTU(row) ?? 0,
        key: 'mtu',
        label: t('MTU'),
        renderCell: (row) => {
          const mtu = getMTU(row);
          return mtu ?? <div className="pf-v6-u-text-color-subtle">{t('Not available')}</div>;
        },
        sortable: true,
      },
      {
        key: 'actions',
        label: '',
        props: { className: 'pf-v6-c-table__action' },
        renderCell: (row) => <VMNetworkActions obj={row} />,
      },
    ],
    [t],
  );
};

export default useVMNetworkTableColumns;
