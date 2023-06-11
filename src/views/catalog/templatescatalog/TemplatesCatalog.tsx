import React, { FC, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { Stack, Toolbar, ToolbarContent } from '@patternfly/react-core';

import { TemplatesCatalogDrawer } from './components/TemplatesCatalogDrawer/TemplatesCatalogDrawer';
import { TemplatesCatalogEmptyState } from './components/TemplatesCatalogEmptyState';
import { TemplatesCatalogFilters } from './components/TemplatesCatalogFilters/TemplatesCatalogFilters';
import { TemplatesCatalogHeader } from './components/TemplatesCatalogHeader';
import { TemplatesCatalogItems } from './components/TemplatesCatalogItems';
import { skeletonCatalog } from './components/TemplatesCatalogSkeleton';
import { useTemplatesWithAvailableSource } from './hooks/useTemplatesWithAvailableSource';
import { useTemplatesFilters } from './hooks/useVmTemplatesFilters';
import { filterTemplates } from './utils/helpers';

import './TemplatesCatalog.scss';

const TemplatesCatalog: FC<RouteComponentProps<{ ns: string }>> = ({
  match: {
    params: { ns: namespace },
  },
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<undefined | V1Template>(undefined);

  const [filters, onFilterChange, clearAll] = useTemplatesFilters();
  const { availableDatasources, availableTemplatesUID, bootSourcesLoaded, loaded, templates } =
    useTemplatesWithAvailableSource({
      namespace: filters.namespace,
      onlyAvailable: filters.onlyAvailable,
      onlyDefault: filters.onlyDefault,
    });

  const filteredTemplates = useMemo(
    () => filterTemplates(templates, filters),
    [templates, filters],
  );

  return (
    <Stack className="vm-catalog" hasGutter>
      {loaded ? (
        <div className="co-catalog-page co-catalog-page--with-sidebar">
          <TemplatesCatalogFilters filters={filters} onFilterChange={onFilterChange} />
          <Stack className="co-catalog-page__content">
            <Toolbar inset={{ default: 'insetNone' }} isSticky>
              <ToolbarContent>
                <TemplatesCatalogHeader
                  filters={filters}
                  itemCount={filteredTemplates.length}
                  onFilterChange={onFilterChange}
                />
              </ToolbarContent>
            </Toolbar>
            {filteredTemplates?.length > 0 ? (
              <TemplatesCatalogItems
                availableDatasources={availableDatasources}
                availableTemplatesUID={availableTemplatesUID}
                bootSourcesLoaded={bootSourcesLoaded}
                filters={filters}
                loaded={loaded}
                onTemplateClick={setSelectedTemplate}
                templates={filteredTemplates}
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
        skeletonCatalog
      )}
      <TemplatesCatalogDrawer
        isOpen={!!selectedTemplate}
        namespace={namespace ?? DEFAULT_NAMESPACE}
        onClose={() => setSelectedTemplate(undefined)}
        template={selectedTemplate}
      />
    </Stack>
  );
};

export default TemplatesCatalog;
