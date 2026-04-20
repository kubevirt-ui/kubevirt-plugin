import React, { FCC } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getName, getUID } from '@kubevirt-utils/resources/shared';
import {
  ANNOTATIONS,
  getTemplateFlavorData,
  getTemplateName,
  getTemplateWorkload,
  Template,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getVMBootSourceLabel } from '@kubevirt-utils/resources/vm/utils/source';
import { ARCHITECTURE_ID, getArchitecture } from '@kubevirt-utils/utils/architecture';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Content, ContentVariants, Flex, FlexItem, Label } from '@patternfly/react-core';
import { Tr } from '@patternfly/react-table';
import { getTemplateOSIcon } from '@virtualmachines/creation-wizard/utils/os-icons/os-icons';

import TemplateRowAvailableSource from '../TemplateRowAvailableSource/TemplateRowAvailableSource';

import TemplatesTableRowCell from './TemplatesTableRowCell';

type TemplatesTableRowProps = {
  activeColumnIDs: string[];
  availableDatasources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  onSelectTemplate: (template: Template) => void;
  selectedTemplate?: Template;
  template: Template;
};

const TemplatesTableRow: FCC<TemplatesTableRowProps> = ({
  activeColumnIDs,
  availableDatasources,
  availableTemplatesUID,
  onSelectTemplate,
  selectedTemplate,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const templateName = getName(template);
  const displayName = getAnnotation(template, ANNOTATIONS.displayName);
  const selectedUID = getUID(selectedTemplate);
  const rowUID = getUID(template);
  const isRowSelected = !!selectedUID && selectedUID === rowUID;

  // Boot source calculation
  const bootSource = getTemplateBootSourceType(template);
  const sourceRef = bootSource?.source?.sourceRef;
  const dataSource =
    sourceRef?.namespace && sourceRef?.name
      ? availableDatasources[`${sourceRef.namespace}-${sourceRef.name}`]
      : undefined;

  // Flavor data
  const { cpuCount, memory } = getTemplateFlavorData(template);

  return (
    <Tr
      isClickable
      isRowSelected={isRowSelected}
      isSelectable
      onClick={() => onSelectTemplate(template)}
    >
      <TemplatesTableRowCell activeColumnIDs={activeColumnIDs} id="name" width={40}>
        <Flex alignItems={{ default: 'alignItemsCenter' }} columnGap={{ default: 'columnGapXs' }}>
          <img alt="os-icon" className="vm-catalog-row-icon" src={getTemplateOSIcon(template)} />
          <FlexItem>
            <Content component={ContentVariants.small}>{getTemplateName(template)}</Content>
          </FlexItem>
          {!isEmpty(displayName) && (
            <Label isCompact variant="outline">
              {templateName}
            </Label>
          )}
        </Flex>
      </TemplatesTableRowCell>
      <TemplatesTableRowCell activeColumnIDs={activeColumnIDs} id={ARCHITECTURE_ID} width={10}>
        <span data-test={`template-arch-${templateName}`}>
          <ArchitectureLabel architecture={getArchitecture(template)} />
        </span>
      </TemplatesTableRowCell>
      <TemplatesTableRowCell activeColumnIDs={activeColumnIDs} id="workload" width={10}>
        <span data-test={`template-workload-${templateName}`}>
          {WORKLOADS_LABELS?.[getTemplateWorkload(template)] ?? NO_DATA_DASH}
        </span>
      </TemplatesTableRowCell>
      <TemplatesTableRowCell activeColumnIDs={activeColumnIDs} id="source">
        <TemplateRowAvailableSource
          isBootSourceAvailable={availableTemplatesUID.has(getUID(template))}
          source={getVMBootSourceLabel(bootSource?.type, dataSource)}
        />
      </TemplatesTableRowCell>
      <TemplatesTableRowCell activeColumnIDs={activeColumnIDs} id="cpu-memory" width={20}>
        <span data-test={`template-cpu-memory-${templateName}`}>
          {t('CPU')} {cpuCount ?? 0} | {t('Memory')} {memory ? readableSizeUnit(memory) : t('N/A')}
        </span>
      </TemplatesTableRowCell>
    </Tr>
  );
};

export default TemplatesTableRow;
