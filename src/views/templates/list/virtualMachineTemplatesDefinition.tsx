import React from 'react';
import { TFunction } from 'i18next';

import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import { getK8sRowId } from '@kubevirt-utils/components/KubevirtTable/utils';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  isVirtualMachineTemplateRequest,
  TemplateOrRequest,
} from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { ARCHITECTURE_ID } from '@kubevirt-utils/utils/architecture';
import { getCluster } from '@multicluster/helpers/selectors';
import { getTemplateArchitecture } from '@templates/utils/utils';

import { getWorkloadProfile } from '../utils/selectors';

import TemplateActionsCell from './cells/TemplateActionsCell';
import TemplateClusterCell from './cells/TemplateClusterCell';
import TemplateCPUMemoryCell from './cells/TemplateCPUMemoryCell';
import TemplateNameCell from './cells/TemplateNameCell';
import TemplateNamespaceCell from './cells/TemplateNamespaceCell';

export const TEMPLATE_COLUMN_KEYS = {
  actions: ACTIONS,
  architecture: ARCHITECTURE_ID,
  cluster: 'cluster',
  cpu: 'cpu',
  name: 'name',
  namespace: 'namespace',
  workload: 'workload',
} as const;

export const getTemplateColumns = (
  t: TFunction,
  namespace: string,
  isAllClustersPage: boolean,
): ColumnConfig<TemplateOrRequest>[] => {
  const columns: ColumnConfig<TemplateOrRequest>[] = [
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
      getValue: (row) =>
        isVirtualMachineTemplateRequest(row) ? '' : t(getWorkloadProfile(row)) ?? '',
      key: TEMPLATE_COLUMN_KEYS.workload,
      label: t('Workload profile'),
      props: { className: 'pf-m-width-15' },
      renderCell: (row) =>
        isVirtualMachineTemplateRequest(row) ? NO_DATA_DASH : <>{t(getWorkloadProfile(row))}</>,
      sortable: true,
    },
    {
      getValue: (row) => getTemplateArchitecture(row) ?? '',
      key: TEMPLATE_COLUMN_KEYS.architecture,
      label: t('Architecture'),
      props: { className: 'pf-m-width-10' },
      renderCell: (row) => <ArchitectureLabel architecture={getTemplateArchitecture(row)} />,
      sortable: true,
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

export const getTemplateRowId = (resource: TemplateOrRequest, index: number): string =>
  getK8sRowId(resource, index, 'template');
