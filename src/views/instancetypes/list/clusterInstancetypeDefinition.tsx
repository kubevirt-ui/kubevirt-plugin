import React from 'react';
import { TFunction } from 'i18next';
import { parseSize } from 'xbytes';

import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getK8sRowId } from '@kubevirt-utils/components/KubevirtTable/utils';
import RedHatLabel from '@kubevirt-utils/components/RedHatLabel/RedHatLabel';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { getLabel, getName } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';

import ClusterInstancetypeActions from '../actions/ClusterInstancetypeActions';

const NameCell = ({ row }: { row: V1beta1VirtualMachineClusterInstancetype }) => (
  <>
    <MulticlusterResourceLink
      cluster={getCluster(row)}
      groupVersionKind={VirtualMachineClusterInstancetypeModelGroupVersionKind}
      inline
      name={getName(row)}
    />
    <RedHatLabel obj={row} />
  </>
);

const ClusterCell = ({ row }: { row: V1beta1VirtualMachineClusterInstancetype }) => (
  <>{getCluster(row) ?? NO_DATA_DASH}</>
);

const CPUCell = ({ row }: { row: V1beta1VirtualMachineClusterInstancetype }) => (
  <>{row?.spec?.cpu?.guest ?? NO_DATA_DASH}</>
);

const MemoryCell = ({ row }: { row: V1beta1VirtualMachineClusterInstancetype }) => {
  const memory = row?.spec?.memory?.guest;
  if (!memory) return <>{NO_DATA_DASH}</>;
  return <>{getHumanizedSize(String(memory))?.string ?? NO_DATA_DASH}</>;
};

const VendorCell = ({ row }: { row: V1beta1VirtualMachineClusterInstancetype }) => (
  <>{getLabel(row, VENDOR_LABEL, NO_DATA_DASH)}</>
);

const ActionsCell = ({ row }: { row: V1beta1VirtualMachineClusterInstancetype }) => (
  <ClusterInstancetypeActions instanceType={row} isKebabToggle />
);

const getMemoryValue = (it: V1beta1VirtualMachineClusterInstancetype): number => {
  const memory = it?.spec?.memory?.guest;
  if (!memory) return 0;
  try {
    return parseSize(`${memory}B`);
  } catch {
    return 0;
  }
};

export const getClusterInstancetypeColumns = (
  t: TFunction,
  showClusterColumn: boolean,
): ColumnConfig<V1beta1VirtualMachineClusterInstancetype>[] => [
  {
    getValue: (row) => getName(row) ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row) => <NameCell row={row} />,
    sortable: true,
  },
  ...(showClusterColumn
    ? [
        {
          getValue: (row: V1beta1VirtualMachineClusterInstancetype) => getCluster(row) ?? '',
          key: 'cluster',
          label: t('Cluster'),
          renderCell: (row: V1beta1VirtualMachineClusterInstancetype) => <ClusterCell row={row} />,
          sortable: true,
        },
      ]
    : []),
  {
    getValue: (row) => row?.spec?.cpu?.guest ?? 0,
    key: 'cpu',
    label: t('CPU'),
    renderCell: (row) => <CPUCell row={row} />,
    sortable: true,
  },
  {
    getValue: getMemoryValue,
    key: 'memory',
    label: t('Memory'),
    renderCell: (row) => <MemoryCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => getLabel(row, VENDOR_LABEL, ''),
    key: 'vendor',
    label: t('Vendor'),
    renderCell: (row) => <VendorCell row={row} />,
  },
  {
    key: 'actions',
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: (row) => <ActionsCell row={row} />,
  },
];

export const getClusterInstancetypeRowId = (
  it: V1beta1VirtualMachineClusterInstancetype,
  index: number,
): string => getK8sRowId(it, index, 'cluster-instancetype');
