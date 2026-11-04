import type { TFunction } from 'i18next';

import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import type { TableExportColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { convertToBaseValue } from '@kubevirt-utils/utils/humanize.js';
import { SortByDirection } from '@patternfly/react-table';

import {
  getDataVolumeCapacity,
  getDataVolumeClaimName,
  getDataVolumePhase,
  getDataVolumeProgress,
  getDataVolumeStorageClass,
} from '../utils';

import DataVolumeActionsCell from './cells/DataVolumeActionsCell';
import DataVolumeCapacityCell from './cells/DataVolumeCapacityCell';
import DataVolumeCreatedCell from './cells/DataVolumeCreatedCell';
import DataVolumeNameCell from './cells/DataVolumeNameCell';
import DataVolumeNamespaceCell from './cells/DataVolumeNamespaceCell';
import DataVolumeProgressCell from './cells/DataVolumeProgressCell';
import DataVolumePVCCell from './cells/DataVolumePVCCell';
import DataVolumeStatusCell from './cells/DataVolumeStatusCell';
import DataVolumeStorageClassCell from './cells/DataVolumeStorageClassCell';

export const DATAVOLUME_COLUMN_KEYS = {
  capacity: 'capacity',
  created: 'created',
  name: 'name',
  namespace: 'namespace',
  progress: 'progress',
  pvc: 'pvc',
  status: 'status',
  storageClass: 'storage-class',
} as const;

export const getDataVolumeColumns = (
  t: TFunction,
  namespace: string,
): TableExportColumnConfig<V1beta1DataVolume>[] => {
  const columns: TableExportColumnConfig<V1beta1DataVolume>[] = [
    {
      getValue: (row) => getName(row) ?? '',
      key: DATAVOLUME_COLUMN_KEYS.name,
      label: t('Name'),
      props: { className: 'pf-m-width-15' },
      renderCell: (row) => <DataVolumeNameCell row={row} />,
      sortable: true,
    },
  ];

  if (!namespace) {
    columns.push({
      getValue: (row) => getNamespace(row) ?? '',
      key: DATAVOLUME_COLUMN_KEYS.namespace,
      label: t('Namespace'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <DataVolumeNamespaceCell row={row} />,
      sortable: true,
    });
  }

  columns.push(
    {
      getValue: (row) => getDataVolumePhase(row) ?? '',
      key: DATAVOLUME_COLUMN_KEYS.status,
      label: t('Status'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <DataVolumeStatusCell row={row} />,
      sortable: true,
    },
    {
      getValue: (row) => getDataVolumeProgress(row) ?? '',
      key: DATAVOLUME_COLUMN_KEYS.progress,
      label: t('Progress'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <DataVolumeProgressCell row={row} />,
      sortable: true,
    },
    {
      getValue: (row) => getDataVolumeCapacity(row) ?? '',
      key: DATAVOLUME_COLUMN_KEYS.capacity,
      label: t('Capacity'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <DataVolumeCapacityCell row={row} />,
      sort: (data, direction) =>
        [...data].sort((a, b) => {
          const cmp =
            (convertToBaseValue(getDataVolumeCapacity(a) ?? '') ?? 0) -
            (convertToBaseValue(getDataVolumeCapacity(b) ?? '') ?? 0);
          return direction === SortByDirection.asc ? cmp : -cmp;
        }),
      sortable: true,
    },
    {
      getValue: (row) => getDataVolumeClaimName(row) ?? '',
      key: DATAVOLUME_COLUMN_KEYS.pvc,
      label: t('PVC'),
      props: { className: 'pf-m-width-15' },
      renderCell: (row) => <DataVolumePVCCell row={row} />,
      sortable: true,
    },
    {
      getValue: (row) => getDataVolumeStorageClass(row) ?? '',
      key: DATAVOLUME_COLUMN_KEYS.storageClass,
      label: t('Storage class'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <DataVolumeStorageClassCell row={row} />,
      sortable: true,
    },
    {
      getValue: (row) => row?.metadata?.creationTimestamp ?? '',
      key: DATAVOLUME_COLUMN_KEYS.created,
      label: t('Created'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <DataVolumeCreatedCell row={row} />,
      sortable: true,
    },
    {
      key: ACTIONS,
      label: '',
      props: { className: 'pf-v6-c-table__action' },
      renderCell: (row) => <DataVolumeActionsCell row={row} />,
    },
  );

  return columns;
};
