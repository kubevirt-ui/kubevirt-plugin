import React, { FCC } from 'react';

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
import { TemplatesCatalogCallbacks } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/types';
import { getTemplateOSIcon } from '@virtualmachines/creation-wizard/utils/os-icons/os-icons';

import TemplateRowAvailableSource from '../../TemplateRowAvailableSource/TemplateRowAvailableSource';

type NameCellProps = {
  callbacks: TemplatesCatalogCallbacks;
  template: V1Template;
};

export const NameCell: FCC<NameCellProps> = ({ callbacks, template }) => {
  const { onTemplateClick, selectedTemplate } = callbacks;
  const displayName = getAnnotation(template, ANNOTATIONS.displayName);
  const isSelected = selectedTemplate?.metadata?.uid === template.metadata?.uid;

  return (
    <span
      className={isSelected ? 'vm-catalog-row--selected' : ''}
      data-test={`template-name-${getName(template)}`}
    >
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

export const SourceCell: FCC<SourceCellProps> = ({ callbacks, template }) => {
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

export const CPUMemoryCell: FCC<CPUMemoryCellProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { cpuCount, memory } = getTemplateFlavorData(template);

  return (
    <span data-test={`template-cpu-memory-${getName(template)}`}>
      {t('CPU')} {cpuCount ?? t('N/A')} | {t('Memory')}{' '}
      {memory ? readableSizeUnit(memory) : t('N/A')}
    </span>
  );
};
