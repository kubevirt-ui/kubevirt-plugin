import React from 'react';
import { TFunction } from 'react-i18next';

import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getK8sRowId } from '@kubevirt-utils/components/KubevirtTable/utils';
import RedHatLabel from '@kubevirt-utils/components/RedHatLabel/RedHatLabel';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { getLabel, getName } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';

import ClusterPreferenceActions from '../actions/ClusterPreferenceActions';

const NameCell = ({ row }: { row: V1beta1VirtualMachineClusterPreference }) => (
  <>
    <MulticlusterResourceLink
      cluster={getCluster(row)}
      groupVersionKind={VirtualMachineClusterPreferenceModelGroupVersionKind}
      inline
      name={getName(row)}
    />
    <RedHatLabel obj={row} />
  </>
);

const VendorCell = ({ row }: { row: V1beta1VirtualMachineClusterPreference }) => (
  <>{getLabel(row, VENDOR_LABEL, NO_DATA_DASH)}</>
);

const ActionsCell = ({ row }: { row: V1beta1VirtualMachineClusterPreference }) => (
  <ClusterPreferenceActions isKebabToggle preference={row} />
);

export const getClusterPreferenceColumns = (
  t: TFunction,
): ColumnConfig<V1beta1VirtualMachineClusterPreference>[] => [
  {
    getValue: (row) => getName(row) ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row) => <NameCell row={row} />,
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

export const getClusterPreferenceRowId = (
  preference: V1beta1VirtualMachineClusterPreference,
  index: number,
): string => getK8sRowId(preference, index, 'cluster-preference');
