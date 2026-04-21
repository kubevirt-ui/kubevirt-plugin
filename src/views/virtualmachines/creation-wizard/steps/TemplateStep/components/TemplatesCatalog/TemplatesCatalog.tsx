import React, { FC, useMemo } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { logTemplateFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import { TEMPLATE_SELECTED } from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PageSection, Stack } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import TemplatesCatalogEmptyState from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesCatalogEmptyState';
import TemplatesCatalogItems from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesCatalogItems/TemplatesCatalogItems';
import CatalogSkeleton from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesCatalogSkeleton';
import TemplatesToolbar from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesToolbar/TemplatesToolbar';
import useHideDeprecatedTemplateTiles from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/hooks/useHideDeprecatedTemplateTiles';
import useTemplatesWithAvailableSource from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/hooks/useTemplatesWithAvailableSource/useTemplatesWithAvailableSource';
import { useTemplatesFilters } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/hooks/useVMTemplatesFilters';
import { filterTemplates } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/utils';

import './TemplateCatalog.scss';

const TemplatesCatalog: FC = () => {
  const { selectedTemplate, setSelectedTemplate, setTemplatesDrawerIsOpen } = useVMWizardStore();

  const [filters, onFilterChange, clearAll] = useTemplatesFilters();
  const { availableDataSources, availableTemplatesUID, bootSourcesLoaded, loaded, templates } =
    useTemplatesWithAvailableSource({
      namespace: filters.namespace,
      onlyAvailable: filters.onlyAvailable,
      onlyDefault: filters.onlyDefault,
    });

  const filteredTemplates = useMemo(
    () => filterTemplates(templates, filters),
    [templates, filters],
  );

  useHideDeprecatedTemplateTiles(onFilterChange);

  const handleTemplateSelect = (template: V1Template) => {
    setSelectedTemplate(template);
    const vm = getTemplateVirtualMachineObject(template);
    vmSignal.value = vm;
    logTemplateFlowEvent(TEMPLATE_SELECTED, template);
    setTemplatesDrawerIsOpen(true);
  };

  return (
    <PageSection className="vm-catalog">
      {loaded ? (
        <div>
          <TemplatesToolbar filters={filters} onFilterChange={onFilterChange} />
          <Stack className="co-catalog-page__content">
            {!isEmpty(filteredTemplates) ? (
              <TemplatesCatalogItems
                availableDatasources={availableDataSources}
                availableTemplatesUID={availableTemplatesUID}
                bootSourcesLoaded={bootSourcesLoaded}
                filters={filters}
                loaded={loaded}
                onTemplateClick={handleTemplateSelect}
                selectedTemplate={selectedTemplate}
                templates={filteredTemplates}
                unfilteredTemplates={templates}
              />
            ) : (
              <TemplatesCatalogEmptyState
                bootSourcesLoaded={bootSourcesLoaded}
                onClearFilters={clearAll}
              />
            )}
          </Stack>
        </div>
      ) : (
        <CatalogSkeleton />
      )}
    </PageSection>
  );
};

export default TemplatesCatalog;
