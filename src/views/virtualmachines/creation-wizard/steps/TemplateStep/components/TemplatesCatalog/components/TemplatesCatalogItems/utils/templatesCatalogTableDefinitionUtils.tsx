import React, { ReactNode } from 'react';
import { TFunction } from 'i18next';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { getName, getUID } from '@kubevirt-utils/resources/shared';
import {
  getTemplateName,
  getTemplateWorkload,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  ARCHITECTURE_ID,
  ARCHITECTURE_LABEL,
  ARCHITECTURE_TITLE,
  getArchitecture,
} from '@kubevirt-utils/utils/architecture';
import { TemplatesCatalogCallbacks } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/types';

import { CPUMemoryCell, NameCell, SourceCell } from '../components/TemplatesCatalogCells';

const renderNameCell = (template: V1Template, callbacks: TemplatesCatalogCallbacks): ReactNode => (
  <NameCell callbacks={callbacks} template={template} />
);

const renderSourceCell = (
  template: V1Template,
  callbacks: TemplatesCatalogCallbacks,
): ReactNode => <SourceCell callbacks={callbacks} template={template} />;

export const getTemplatesCatalogColumns = (
  t: TFunction,
): ColumnConfig<V1Template, TemplatesCatalogCallbacks>[] => [
  {
    getValue: (row) => getTemplateName(row) ?? '',
    key: 'name',
    label: t('Name'),
    props: { className: 'pf-m-width-40' },
    renderCell: renderNameCell,
    sortable: true,
  },
  {
    getValue: (row) => row.metadata?.labels?.[ARCHITECTURE_LABEL] ?? '',
    key: ARCHITECTURE_ID,
    label: ARCHITECTURE_TITLE,
    props: { className: 'pf-m-width-10' },
    renderCell: (row) => (
      <span data-test={`template-arch-${getName(row)}`}>
        <ArchitectureLabel architecture={getArchitecture(row)} />
      </span>
    ),
    sortable: true,
  },
  {
    getValue: (row) => getTemplateWorkload(row) ?? '',
    key: 'workload',
    label: t('Workload'),
    props: { className: 'pf-m-width-10' },
    renderCell: (row) => (
      <span data-test={`template-workload-${getName(row)}`}>
        {WORKLOADS_LABELS?.[getTemplateWorkload(row)] ?? NO_DATA_DASH}
      </span>
    ),
  },
  {
    key: 'source',
    label: t('Boot source'),
    renderCell: renderSourceCell,
  },
  {
    key: 'cpu',
    label: t('CPU | Memory'),
    props: { className: 'pf-m-width-20' },
    renderCell: (row) => <CPUMemoryCell template={row} />,
  },
];

export const getTemplateCatalogRowId = (template: V1Template): string =>
  getUID(template) ?? getName(template) ?? 'unknown-template';
export { TemplatesCatalogCallbacks } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/types';
