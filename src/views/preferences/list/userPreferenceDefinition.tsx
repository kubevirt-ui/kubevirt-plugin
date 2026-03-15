import React from 'react';
import { TFunction } from 'react-i18next';

import { VirtualMachinePreferenceModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1VirtualMachinePreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import RedHatLabel from '@kubevirt-utils/components/RedHatLabel/RedHatLabel';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';

import UserPreferenceActions from '../actions/UserPreferenceActions';

const NameCell = ({ row }: { row: V1beta1VirtualMachinePreference }) => (
  <>
    <MulticlusterResourceLink
      cluster={getCluster(row)}
      groupVersionKind={VirtualMachinePreferenceModelGroupVersionKind}
      inline
      name={getName(row)}
      namespace={getNamespace(row)}
    />
    <RedHatLabel obj={row} />
  </>
);

const NamespaceCell = ({ row }: { row: V1beta1VirtualMachinePreference }) => (
  <>{getNamespace(row) ?? NO_DATA_DASH}</>
);

const VendorCell = ({ row }: { row: V1beta1VirtualMachinePreference }) => (
  <>{getLabel(row, VENDOR_LABEL, NO_DATA_DASH)}</>
);

const ActionsCell = ({ row }: { row: V1beta1VirtualMachinePreference }) => (
  <UserPreferenceActions isKebabToggle preference={row} />
);

export const getUserPreferenceColumns = (
  t: TFunction,
  showNamespaceColumn: boolean,
): ColumnConfig<V1beta1VirtualMachinePreference>[] => [
  {
    getValue: (row) => getName(row) ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row) => <NameCell row={row} />,
    sortable: true,
  },
  ...(showNamespaceColumn
    ? [
        {
          getValue: (row: V1beta1VirtualMachinePreference) => getNamespace(row) ?? '',
          key: 'namespace',
          label: t('Namespace'),
          renderCell: (row: V1beta1VirtualMachinePreference) => <NamespaceCell row={row} />,
          sortable: true,
        },
      ]
    : []),
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

export const getUserPreferenceRowId = (
  preference: V1beta1VirtualMachinePreference,
  index: number,
): string => {
  const cluster = getCluster(preference) ?? 'local';
  const namespace = getNamespace(preference) ?? '';
  const name = getName(preference) ?? '';
  return name ? `${cluster}-${namespace}-${name}` : `user-preference-${index}`;
};
