import React from 'react';
import { TFunction } from 'react-i18next';

import {
  V1beta1DataImportCron,
  V1beta1DataVolume,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getK8sRowId } from '@kubevirt-utils/components/KubevirtTable/utils';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import {
  ClusterNamespacedResourceMap,
  getName,
  getNamespace,
} from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { ARCHITECTURE_ID, ARCHITECTURE_LABEL } from '@kubevirt-utils/utils/architecture';
import { getCluster } from '@multicluster/helpers/selectors';

import { BootableResource } from '../utils/types';
import { getPreferenceReadableOS, getSourcePreferenceLabelValue } from '../utils/utils';

import BootableVolumeActionsCell from './cells/BootableVolumeActionsCell';
import BootableVolumeArchitectureCell from './cells/BootableVolumeArchitectureCell';
import BootableVolumeClusterCell from './cells/BootableVolumeClusterCell';
import BootableVolumeDescriptionCell from './cells/BootableVolumeDescriptionCell';
import BootableVolumeNameCell from './cells/BootableVolumeNameCell';
import BootableVolumeNamespaceCell from './cells/BootableVolumeNamespaceCell';
import BootableVolumeOSCell from './cells/BootableVolumeOSCell';
import BootableVolumePreferenceCell from './cells/BootableVolumePreferenceCell';

export const BOOTABLE_VOLUME_COLUMN_KEYS = {
  architecture: ARCHITECTURE_ID,
  cluster: 'cluster',
  description: 'description',
  name: 'name',
  namespace: 'namespace',
  os: 'os',
  preference: 'preference',
} as const;

export type BootableVolumeCallbacks = {
  clusterParam: string;
  dataImportCrons: V1beta1DataImportCron[];
  dvSources: ClusterNamespacedResourceMap<V1beta1DataVolume>;
  preferences: V1beta1VirtualMachineClusterPreference[];
};

export const getBootableVolumeColumns = (
  t: TFunction,
  isAllClustersPage: boolean,
  isAllNamespaces: boolean,
  preferences: V1beta1VirtualMachineClusterPreference[],
): ColumnConfig<BootableResource, BootableVolumeCallbacks>[] => {
  const columns: ColumnConfig<BootableResource, BootableVolumeCallbacks>[] = [
    {
      getValue: (row) => getName(row) ?? '',
      key: BOOTABLE_VOLUME_COLUMN_KEYS.name,
      label: t('Name'),
      props: { className: 'pf-m-width-20' },
      renderCell: (row, callbacks) => (
        <BootableVolumeNameCell callbacks={callbacks} row={row} t={t} />
      ),
      sortable: true,
    },
  ];

  if (isAllClustersPage) {
    columns.push({
      getValue: (row) => getCluster(row) ?? '',
      key: BOOTABLE_VOLUME_COLUMN_KEYS.cluster,
      label: t('Cluster'),
      props: { className: 'pf-m-width-20' },
      renderCell: (row) => <BootableVolumeClusterCell row={row} />,
      sortable: true,
    });
  }

  if (isAllNamespaces) {
    columns.push({
      getValue: (row) => getNamespace(row) ?? '',
      key: BOOTABLE_VOLUME_COLUMN_KEYS.namespace,
      label: t('Namespace'),
      props: { className: 'pf-m-width-20' },
      renderCell: (row, callbacks) => (
        <BootableVolumeNamespaceCell callbacks={callbacks} row={row} />
      ),
      sortable: true,
    });
  }

  columns.push(
    {
      getValue: (row) => row?.metadata?.labels?.[ARCHITECTURE_LABEL] ?? '',
      key: BOOTABLE_VOLUME_COLUMN_KEYS.architecture,
      label: t('Architecture'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <BootableVolumeArchitectureCell row={row} />,
      sortable: true,
    },
    {
      getValue: (row) => getPreferenceReadableOS(row, preferences) ?? '',
      key: BOOTABLE_VOLUME_COLUMN_KEYS.os,
      label: t('Operating system'),
      props: { className: 'pf-m-width-15' },
      renderCell: (row, callbacks) => <BootableVolumeOSCell callbacks={callbacks} row={row} />,
      sortable: true,
    },
    {
      getValue: (row) => row?.metadata?.annotations?.[ANNOTATIONS.description] ?? '',
      key: BOOTABLE_VOLUME_COLUMN_KEYS.description,
      label: t('Description'),
      props: { className: 'pf-m-width-15' },
      renderCell: (row) => <BootableVolumeDescriptionCell row={row} />,
      sortable: true,
    },
    {
      getValue: (row) => getSourcePreferenceLabelValue(row) ?? '',
      key: BOOTABLE_VOLUME_COLUMN_KEYS.preference,
      label: t('Preference'),
      props: { className: 'pf-m-width-15' },
      renderCell: (row) => <BootableVolumePreferenceCell row={row} />,
      sortable: true,
    },
    {
      key: ACTIONS,
      label: '',
      props: { className: 'pf-v6-c-table__action' },
      renderCell: (row, callbacks) => <BootableVolumeActionsCell callbacks={callbacks} row={row} />,
    },
  );

  return columns;
};

export const getBootableVolumeRowId = (resource: BootableResource, index: number): string =>
  getK8sRowId(resource, index, 'bootable-volume');
