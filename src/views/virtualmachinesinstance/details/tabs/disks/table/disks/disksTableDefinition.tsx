import React, { ReactNode } from 'react';
import { TFunction } from 'i18next';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { DiskPresentation } from '../../utils/virtualMachinesInstancePageDisksTabUtils';

const renderSourceCell = (disk: DiskPresentation): ReactNode => {
  if (disk.namespace) {
    return (
      <ResourceLink
        groupVersionKind={modelToGroupVersionKind(PersistentVolumeClaimModel)}
        name={disk.source}
        namespace={disk.namespace}
      />
    );
  }
  return <span data-test={`disk-source-${disk.name}`}>{disk.source ?? NO_DATA_DASH}</span>;
};

const renderSizeCell = (disk: DiskPresentation): ReactNode => {
  const size = disk.size ? getHumanizedSize(disk.size).string : null;
  return <span data-test={`disk-size-${disk.name}`}>{size ?? disk.size ?? NO_DATA_DASH}</span>;
};

export const getVMIDisksTableColumns = (t: TFunction): ColumnConfig<DiskPresentation>[] => [
  {
    getValue: (row) => row.name ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row) => (
      <span data-test={`disk-name-${row.name}`}>{row.name ?? NO_DATA_DASH}</span>
    ),
    sortable: true,
  },
  {
    getValue: (row) => row.source ?? '',
    key: 'source',
    label: t('Source'),
    renderCell: renderSourceCell,
    sortable: true,
  },
  {
    getValue: (row) => row.size ?? '',
    key: 'size',
    label: t('Size'),
    renderCell: renderSizeCell,
    sortable: true,
  },
  {
    getValue: (row) => row.drive ?? '',
    key: 'drive',
    label: t('Drive'),
    renderCell: (row) => (
      <span data-test={`disk-drive-${row.name}`}>{row.drive ?? NO_DATA_DASH}</span>
    ),
    sortable: true,
  },
  {
    getValue: (row) => row.interface ?? '',
    key: 'interface',
    label: t('Interface'),
    renderCell: (row) => (
      <span data-test={`disk-interface-${row.name}`}>{row.interface ?? NO_DATA_DASH}</span>
    ),
    sortable: true,
  },
  {
    getValue: (row) => row.storageClass ?? '',
    key: 'storageClass',
    label: t('Storage Class'),
    renderCell: (row) => (
      <span data-test={`disk-storageclass-${row.name}`}>{row.storageClass ?? NO_DATA_DASH}</span>
    ),
    sortable: true,
  },
];

export const getVMIDiskRowId = (disk: DiskPresentation, index: number): string =>
  disk.name ? `${disk.name}-${disk.source ?? 'no-source'}` : `disk-${index}`;
