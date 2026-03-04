import React, { FC, ReactNode } from 'react';
import { TFunction } from 'react-i18next';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getName, getUID } from '@kubevirt-utils/resources/shared';
import {
  ANNOTATIONS,
  getTemplateFlavorData,
  getTemplateName,
  getTemplateWorkload,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getVMBootSourceLabel } from '@kubevirt-utils/resources/vm/utils/source';
import {
  ARCHITECTURE_ID,
  ARCHITECTURE_LABEL,
  ARCHITECTURE_TITLE,
  getArchitecture,
} from '@kubevirt-utils/utils/architecture';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant, Label } from '@patternfly/react-core';

import TemplateRowAvailableSource from './components/TemplateRowAvailableSource/TemplateRowAvailableSource';
import { getTemplateOSIcon } from './utils/os-icons';

export type TemplatesCatalogCallbacks = {
  availableDatasources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  onTemplateClick: (template: V1Template) => void;
};

type NameCellProps = {
  callbacks: TemplatesCatalogCallbacks;
  template: V1Template;
};

const NameCell: FC<NameCellProps> = ({ callbacks, template }) => {
  const { onTemplateClick } = callbacks;
  const displayName = getAnnotation(template, ANNOTATIONS.displayName);

  return (
    <span data-test-id={`template-name-${getName(template)}`}>
      <img alt="" className="vm-catalog-row-icon" src={getTemplateOSIcon(template)} />
      <Button isInline onClick={() => onTemplateClick(template)} variant={ButtonVariant.link}>
        {getTemplateName(template)}{' '}
        {!isEmpty(displayName) && (
          <Label isCompact variant="outline">
            {getName(template)}
          </Label>
        )}
      </Button>
    </span>
  );
};

type SourceCellProps = {
  callbacks: TemplatesCatalogCallbacks;
  template: V1Template;
};

const SourceCell: FC<SourceCellProps> = ({ callbacks, template }) => {
  const { availableDatasources, availableTemplatesUID } = callbacks;
  const bootSource = getTemplateBootSourceType(template);
  const dataSource =
    availableDatasources[
      `${bootSource?.source?.sourceRef?.namespace}-${bootSource?.source?.sourceRef?.name}`
    ];

  return (
    <TemplateRowAvailableSource
      isBootSourceAvailable={availableTemplatesUID.has(template?.metadata?.uid)}
      source={getVMBootSourceLabel(bootSource?.type, dataSource)}
    />
  );
};

type CPUMemoryCellProps = {
  template: V1Template;
};

const CPUMemoryCell: FC<CPUMemoryCellProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { cpuCount, memory } = getTemplateFlavorData(template);

  return (
    <span data-test-id={`template-cpu-memory-${getName(template)}`}>
      {t('CPU')} {cpuCount} | {t('Memory')} {readableSizeUnit(memory)}
    </span>
  );
};

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
    getValue: (row) => getName(row) ?? '',
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
      <span data-test-id={`template-arch-${getName(row)}`}>
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
      <span data-test-id={`template-workload-${getName(row)}`}>
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
