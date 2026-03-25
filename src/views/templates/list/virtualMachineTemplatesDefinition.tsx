import React from 'react';
import { TFunction } from 'react-i18next';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import { getK8sRowId } from '@kubevirt-utils/components/KubevirtTable/utils';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import {
  ClusterNamespacedResourceMap,
  getName,
  getNamespace,
} from '@kubevirt-utils/resources/shared';
import { ARCHITECTURE_ID, getArchitecture } from '@kubevirt-utils/utils/architecture';
import { getCluster } from '@multicluster/helpers/selectors';

import { getWorkloadProfile } from '../utils/selectors';

import TemplateActionsCell from './cells/TemplateActionsCell';
import TemplateBootSourceCell from './cells/TemplateBootSourceCell';
import TemplateClusterCell from './cells/TemplateClusterCell';
import TemplateCPUMemoryCell from './cells/TemplateCPUMemoryCell';
import TemplateNameCell from './cells/TemplateNameCell';
import TemplateNamespaceCell from './cells/TemplateNamespaceCell';

export const TEMPLATE_COLUMN_KEYS = {
  actions: ACTIONS,
  architecture: ARCHITECTURE_ID,
  availability: 'availability',
  cluster: 'cluster',
  cpu: 'cpu',
  name: 'name',
  namespace: 'namespace',
  workload: 'workload',
} as const;

export type TemplateCallbacks = {
  availableDataSources: ClusterNamespacedResourceMap<V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  cloneInProgressDataSources: ClusterNamespacedResourceMap<V1beta1DataSource>;
};

export const getTemplateColumns = (
  t: TFunction,
  namespace: string,
  isAllClustersPage: boolean,
): ColumnConfig<V1Template, TemplateCallbacks>[] => {
  const columns: ColumnConfig<V1Template, TemplateCallbacks>[] = [
    {
      getValue: (row) => getName(row) ?? '',
      key: TEMPLATE_COLUMN_KEYS.name,
      label: t('Name'),
      props: { className: 'pf-m-width-20' },
      renderCell: (row) => <TemplateNameCell row={row} />,
      sortable: true,
    },
  ];

  if (isAllClustersPage) {
    columns.push({
      getValue: (row) => getCluster(row) ?? '',
      key: TEMPLATE_COLUMN_KEYS.cluster,
      label: t('Cluster'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <TemplateClusterCell row={row} />,
      sortable: true,
    });
  }

  columns.push({
    getValue: (row) => getArchitecture(row) ?? '',
    key: TEMPLATE_COLUMN_KEYS.architecture,
    label: t('Architecture'),
    props: { className: 'pf-m-width-10' },
    renderCell: (row) => <ArchitectureLabel architecture={getArchitecture(row)} />,
    sortable: true,
  });

  if (!namespace) {
    columns.push({
      getValue: (row) => getNamespace(row) ?? '',
      key: TEMPLATE_COLUMN_KEYS.namespace,
      label: t('Namespace'),
      renderCell: (row) => <TemplateNamespaceCell row={row} />,
      sortable: true,
    });
  }

  columns.push(
    {
      getValue: (row) => t(getWorkloadProfile(row)) ?? '',
      key: TEMPLATE_COLUMN_KEYS.workload,
      label: t('Workload profile'),
      props: { className: 'pf-m-width-15' },
      renderCell: (row) => <>{t(getWorkloadProfile(row))}</>,
      sortable: true,
    },
    {
      key: TEMPLATE_COLUMN_KEYS.availability,
      label: t('Boot source'),
      props: { className: 'pf-m-width-30' },
      renderCell: (row, callbacks) => <TemplateBootSourceCell callbacks={callbacks} row={row} />,
    },
    {
      additional: true,
      key: TEMPLATE_COLUMN_KEYS.cpu,
      label: t('CPU | Memory'),
      renderCell: (row) => <TemplateCPUMemoryCell row={row} />,
    },
    {
      key: TEMPLATE_COLUMN_KEYS.actions,
      label: '',
      props: { className: 'pf-v6-c-table__action' },
      renderCell: (row) => <TemplateActionsCell row={row} />,
    },
  );

  return columns;
};

export const getTemplateRowId = (template: V1Template, index: number): string =>
  getK8sRowId(template, index, 'template');
