import React, { FC, useMemo } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getUID } from '@kubevirt-utils/resources/shared';
import { getTemplateName, Template } from '@kubevirt-utils/resources/template';
import { ARCHITECTURE_ID, ARCHITECTURE_TITLE } from '@kubevirt-utils/utils/architecture';
import { Table, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';

import TemplatesTableRow from './TemplatesTableRow';

type TemplatesTableProps = {
  availableDatasources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  bootSourcesLoaded: boolean;
  loaded: boolean;
  onTemplateClick: (template: Template) => void;
  templates: Template[];
};

const TemplatesTable: FC<TemplatesTableProps> = ({
  availableDatasources,
  availableTemplatesUID,
  bootSourcesLoaded,
  loaded,
  onTemplateClick,
  templates,
}) => {
  const { t } = useKubevirtTranslation();
  const { selectedTemplate } = useVMWizardStore();

  const activeColumnIDs = useMemo(
    () => ['name', ARCHITECTURE_ID, 'workload', 'source', 'cpu-memory'],
    [],
  );

  const sortedTemplates = useMemo(
    () =>
      [...templates].sort((a: Template, b: Template) =>
        (getTemplateName(a) ?? '').localeCompare(getTemplateName(b) ?? ''),
      ),
    [templates],
  );

  const handleSelectTemplate = (template: Template) => {
    onTemplateClick(template);
  };

  if (!loaded || !bootSourcesLoaded) {
    return null;
  }

  return (
    <Table aria-label={t('Templates catalog table')} variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th id="name" width={40}>
            {t('Name')}
          </Th>
          <Th id={ARCHITECTURE_ID} width={10}>
            {ARCHITECTURE_TITLE}
          </Th>
          <Th id="workload" width={10}>
            {t('Workload')}
          </Th>
          <Th id="source">{t('Boot source')}</Th>
          <Th id="cpu-memory" width={20}>
            {t('CPU | Memory')}
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {sortedTemplates.map((template, idx) => (
          <TemplatesTableRow
            activeColumnIDs={activeColumnIDs}
            availableDatasources={availableDatasources}
            availableTemplatesUID={availableTemplatesUID}
            key={getUID(template) ?? getTemplateName(template) ?? `template-${idx}`}
            onSelectTemplate={handleSelectTemplate}
            selectedTemplate={selectedTemplate}
            template={template}
          />
        ))}
      </Tbody>
    </Table>
  );
};

export default TemplatesTable;
