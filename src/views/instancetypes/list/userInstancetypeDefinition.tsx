import React from 'react';
import { TFunction } from 'i18next';
import { parseSize } from 'xbytes';

import { VirtualMachineInstancetypeModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getK8sRowId } from '@kubevirt-utils/components/KubevirtTable/utils';
import RedHatLabel from '@kubevirt-utils/components/RedHatLabel/RedHatLabel';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';

import UserInstancetypeActions from '../actions/UserInstancetypeActions';

const NameCell = ({ row }: { row: V1beta1VirtualMachineInstancetype }) => (
  <>
    <MulticlusterResourceLink
      cluster={getCluster(row)}
      groupVersionKind={VirtualMachineInstancetypeModelGroupVersionKind}
      inline
      name={getName(row)}
      namespace={getNamespace(row)}
    />
    <RedHatLabel obj={row} />
  </>
);

const ClusterCell = ({ row }: { row: V1beta1VirtualMachineInstancetype }) => (
  <>{getCluster(row) ?? NO_DATA_DASH}</>
);

const NamespaceCell = ({ row }: { row: V1beta1VirtualMachineInstancetype }) => (
  <>{getNamespace(row) ?? NO_DATA_DASH}</>
);

const CPUCell = ({ row }: { row: V1beta1VirtualMachineInstancetype }) => (
  <>{row?.spec?.cpu?.guest ?? NO_DATA_DASH}</>
);

const MemoryCell = ({ row }: { row: V1beta1VirtualMachineInstancetype }) => {
  const memory = row?.spec?.memory?.guest;
  if (!memory) return <>{NO_DATA_DASH}</>;
  return <>{getHumanizedSize(String(memory))?.string ?? NO_DATA_DASH}</>;
};

const VendorCell = ({ row }: { row: V1beta1VirtualMachineInstancetype }) => (
  <>{getLabel(row, VENDOR_LABEL, NO_DATA_DASH)}</>
);

const ActionsCell = ({ row }: { row: V1beta1VirtualMachineInstancetype }) => (
  <UserInstancetypeActions instanceType={row} isKebabToggle />
);

const getMemoryValue = (it: V1beta1VirtualMachineInstancetype): number => {
  const memory = it?.spec?.memory?.guest;
  if (!memory) return 0;
  try {
    return parseSize(`${memory}B`);
  } catch {
    return 0;
  }
};

export const getUserInstancetypeColumns = (
  t: TFunction,
  showClusterColumn: boolean,
  showNamespaceColumn: boolean,
): ColumnConfig<V1beta1VirtualMachineInstancetype>[] => [
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
          getValue: (row: V1beta1VirtualMachineInstancetype) => getCluster(row) ?? '',
          key: 'cluster',
          label: t('Cluster'),
          renderCell: (row: V1beta1VirtualMachineInstancetype) => <ClusterCell row={row} />,
          sortable: true,
        },
      ]
    : []),
  ...(showNamespaceColumn
    ? [
        {
          getValue: (row: V1beta1VirtualMachineInstancetype) => getNamespace(row) ?? '',
          key: 'namespace',
          label: t('Namespace'),
          renderCell: (row: V1beta1VirtualMachineInstancetype) => <NamespaceCell row={row} />,
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

export const getUserInstancetypeRowId = (
  it: V1beta1VirtualMachineInstancetype,
  index: number,
): string => getK8sRowId(it, index, 'instancetype');
