import React, { FC, ReactNode } from 'react';
import { TFunction } from 'react-i18next';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-utils/models';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  getGroupVersionKindForResource,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';

import { OtherVMNetworkWithType } from './types';
import { getVMNetworkTypeLabel } from './utils';

const renderNameCell = (row: OtherVMNetworkWithType): ReactNode => {
  const name = getName(row);
  const namespace = getNamespace(row);

  return (
    <span data-test-id={`vmnetwork-other-name-${name}`}>
      <ResourceLink
        groupVersionKind={getGroupVersionKindForResource(row)}
        name={name}
        namespace={namespace}
      />
    </span>
  );
};

const renderNamespaceCell = (row: OtherVMNetworkWithType): ReactNode => {
  const namespace = getNamespace(row);

  if (namespace) {
    return (
      <ResourceLink groupVersionKind={modelToGroupVersionKind(NamespaceModel)} name={namespace} />
    );
  }

  return <span data-test-id={`vmnetwork-other-namespace-${getName(row)}`}>{NO_DATA_DASH}</span>;
};

type TypeCellProps = {
  row: OtherVMNetworkWithType;
};

const TypeCell: FC<TypeCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  return (
    <span data-test-id={`vmnetwork-other-type-${getName(row)}`}>
      {getVMNetworkTypeLabel(row.type, t)}
    </span>
  );
};

export const getVMNetworkOtherTypesColumns = (
  t: TFunction,
): ColumnConfig<OtherVMNetworkWithType>[] => [
  {
    getValue: (row) => getName(row) ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: renderNameCell,
    sortable: true,
  },
  {
    getValue: (row) => getNamespace(row) ?? '',
    key: 'namespace',
    label: t('Namespace'),
    renderCell: renderNamespaceCell,
    sortable: true,
  },
  {
    getValue: (row) => row.type ?? '',
    key: 'type',
    label: t('Type'),
    renderCell: (row) => <TypeCell row={row} />,
    sortable: true,
  },
];

export const getVMNetworkOtherRowId = (row: OtherVMNetworkWithType): string =>
  getUID(row) ?? `${getName(row)}-${getNamespace(row) ?? 'cluster'}`;
