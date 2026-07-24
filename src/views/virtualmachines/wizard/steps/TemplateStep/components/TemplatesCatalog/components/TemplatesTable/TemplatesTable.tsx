import React, { type FC, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getUID } from '@kubevirt-utils/resources/shared';
import { getTemplateName, type Template } from '@kubevirt-utils/resources/template';
import { ARCHITECTURE_ID, ARCHITECTURE_TITLE } from '@kubevirt-utils/utils/architecture';
import { Table, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';

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
  const { control } = useVMWizard();
  const selectedTemplate = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_VM_DATA.SELECTED_TEMPLATE,
  });

  const activeColumnIDs = useMemo(
    () => ['name', ARCHITECTURE_ID, 'category', 'source', 'cpu-memory'],
    [],
  );

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
          <Th
            id="category"
            info={{
              tooltip: t(
                'Shows Workload profile for OpenShift templates and Category for VM templates.',
              ),
            }}
            width={10}
          >
            {t('Category')}
          </Th>
          <Th id="source">{t('Boot source')}</Th>
          <Th id="cpu-memory" width={20}>
            {t('CPU | Memory')}
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {templates.map((template) => (
          <TemplatesTableRow
            activeColumnIDs={activeColumnIDs}
            availableDatasources={availableDatasources}
            availableTemplatesUID={availableTemplatesUID}
            key={getUID(template) ?? getTemplateName(template)}
            onSelectTemplate={onTemplateClick}
            selectedTemplate={selectedTemplate}
            template={template}
          />
        ))}
      </Tbody>
    </Table>
  );
};

export default TemplatesTable;
