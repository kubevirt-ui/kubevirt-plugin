import { type FC, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getCPUMemoryTitle } from '@kubevirt-utils/components/CPUMemory/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getUID, type ResourceMap } from '@kubevirt-utils/resources/shared';
import { getTemplateName, type Template } from '@kubevirt-utils/resources/template';
import { ARCHITECTURE_ID, ARCHITECTURE_TITLE } from '@kubevirt-utils/utils/architecture';
import { Table, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';

import { getTemplateClusterPreference } from '../../../../utils/getTemplateClusterPreference';
import TemplatesTableRow from './TemplatesTableRow';

import './TemplatesTable.scss';

type TemplatesTableProps = {
  availableDatasources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  bootSourcesLoaded: boolean;
  clusterPreferencesByName: ResourceMap<V1beta1VirtualMachineClusterPreference>;
  loaded: boolean;
  onTemplateClick: (template: Template) => void;
  templates: Template[];
};

const TemplatesTable: FC<TemplatesTableProps> = ({
  availableDatasources,
  availableTemplatesUID,
  bootSourcesLoaded,
  clusterPreferencesByName,
  loaded,
  onTemplateClick,
  templates,
}) => {
  const { t } = useKubevirtTranslation();
  const { control } = useVMWizardForm();
  const selectedTemplate = useWatch({
    control,
    name: 'template.selectedTemplate',
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
          <Th id="name" width={35}>
            {t('Name')}
          </Th>
          <Th id={ARCHITECTURE_ID} width={10}>
            {ARCHITECTURE_TITLE}
          </Th>
          <Th
            id="category"
            info={{
              className: 'table-column-help-width',
              tooltip: t(
                'Shows Workload profile for OpenShift templates and Category for VM templates.',
              ),
            }}
            width={15}
          >
            {t('Category')}
          </Th>
          <Th id="source">{t('Boot source')}</Th>
          <Th id="cpu-memory" width={20}>
            {getCPUMemoryTitle(t)}
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {templates.map((template) => (
          <TemplatesTableRow
            activeColumnIDs={activeColumnIDs}
            availableDatasources={availableDatasources}
            availableTemplatesUID={availableTemplatesUID}
            clusterPreference={getTemplateClusterPreference(template, clusterPreferencesByName)}
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
