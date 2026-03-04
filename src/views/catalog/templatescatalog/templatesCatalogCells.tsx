import React, { FC } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getName } from '@kubevirt-utils/resources/shared';
import {
  ANNOTATIONS,
  getTemplateFlavorData,
  getTemplateName,
} from '@kubevirt-utils/resources/template';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getVMBootSourceLabel } from '@kubevirt-utils/resources/vm/utils/source';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant, Label } from '@patternfly/react-core';

import TemplateRowAvailableSource from './components/TemplateRowAvailableSource/TemplateRowAvailableSource';
import { getTemplateOSIcon } from './utils/os-icons';
import { TemplatesCatalogCallbacks } from './types';

type NameCellProps = {
  callbacks: TemplatesCatalogCallbacks;
  template: V1Template;
};

export const NameCell: FC<NameCellProps> = ({ callbacks, template }) => {
  const { onTemplateClick } = callbacks;
  const displayName = getAnnotation(template, ANNOTATIONS.displayName);

  return (
    <span data-test={`template-name-${getName(template)}`}>
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

export const SourceCell: FC<SourceCellProps> = ({ callbacks, template }) => {
  const { availableDatasources, availableTemplatesUID } = callbacks;
  const bootSource = getTemplateBootSourceType(template);
  const sourceRef = bootSource?.source?.sourceRef;
  const dataSource =
    sourceRef?.namespace && sourceRef?.name
      ? availableDatasources[`${sourceRef.namespace}-${sourceRef.name}`]
      : undefined;

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

export const CPUMemoryCell: FC<CPUMemoryCellProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { cpuCount, memory } = getTemplateFlavorData(template);

  return (
    <span data-test={`template-cpu-memory-${getName(template)}`}>
      {t('CPU')} {cpuCount ?? 0} | {t('Memory')} {memory ? readableSizeUnit(memory) : t('N/A')}
    </span>
  );
};
