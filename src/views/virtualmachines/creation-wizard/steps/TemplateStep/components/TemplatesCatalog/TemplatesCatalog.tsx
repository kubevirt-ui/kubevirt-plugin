import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { logTemplateFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import { TEMPLATE_SELECTED } from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PageSection, Stack } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import TemplatesCatalogEmptyState from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesCatalogEmptyState';
import TemplatesCatalogItems from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesCatalogItems';
import CatalogSkeleton from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesCatalogSkeleton';
import TemplatesToolbar from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesToolbar/TemplatesToolbar';
import useHideDeprecatedTemplateTiles from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/hooks/useHideDeprecatedTemplateTiles';
import { useTemplatesWithAvailableSource } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/hooks/useTemplatesWithAvailableSource/useTemplatesWithAvailableSource';
import { useTemplatesFilters } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/hooks/useVMTemplatesFilters';
import { filterTemplates } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/utils';
import { TemplatesCatalogDrawer } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/TemplatesCatalogDrawer';

import './TemplateCatalog.scss';

const TemplatesCatalog: FC = () => {
  const { ns: namespace } = useParams<{ ns: string }>();
  const { selectedTemplate, setSelectedTemplate } = useVMWizardStore();

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

  return (
    <PageSection className="vm-catalog">
      {loaded ? (
        <div>
          <TemplatesToolbar filters={filters} onFilterChange={onFilterChange} />
          <Stack className="co-catalog-page__content">
            {!isEmpty(filteredTemplates) ? (
              <TemplatesCatalogItems
                onTemplateClick={(template) => {
                  setSelectedTemplate(template);
                  logTemplateFlowEvent(TEMPLATE_SELECTED, template);
                }}
                availableDatasources={availableDataSources}
                availableTemplatesUID={availableTemplatesUID}
                bootSourcesLoaded={bootSourcesLoaded}
                filters={filters}
                loaded={loaded}
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
      <TemplatesCatalogDrawer
        isOpen={!!selectedTemplate}
        namespace={namespace ?? DEFAULT_NAMESPACE}
        onClose={() => setSelectedTemplate(undefined)}
        template={selectedTemplate}
      />
    </PageSection>
  );
};

export default TemplatesCatalog;
