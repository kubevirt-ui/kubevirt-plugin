import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { Stack, Toolbar, ToolbarContent } from '@patternfly/react-core';

import { TemplatesCatalogDrawer } from './components/TemplatesCatalogDrawer/TemplatesCatalogDrawer';
import { TemplatesCatalogEmptyState } from './components/TemplatesCatalogEmptyState';
import { TemplatesCatalogFilters } from './components/TemplatesCatalogFilters/TemplatesCatalogFilters';
import { TemplatesCatalogHeader } from './components/TemplatesCatalogHeader';
import { TemplatesCatalogItems } from './components/TemplatesCatalogItems';
import { TemplatesCatalogPageHeader } from './components/TemplatesCatalogPageHeader';
import { skeletonCatalog } from './components/TemplatesCatalogSkeleton';
import { useTemplatesWithAvailableSource } from './hooks/useTemplatesWithAvailableSource';
import { useTemplatesFilters } from './hooks/useVmTemplatesFilters';
import { filterTemplates } from './utils/helpers';

import './TemplatesCatalog.scss';

const TemplatesCatalog: React.FC<RouteComponentProps<{ ns: string }>> = ({
  match: {
    params: { ns: namespace },
  },
}) => {
  const [selectedTemplate, setSelectedTemplate] = React.useState<V1Template | undefined>(undefined);

  const [filters, onFilterChange, clearAll] = useTemplatesFilters();
  const { templates, availableTemplatesUID, loaded, bootSourcesLoaded, error } =
    useTemplatesWithAvailableSource({
      namespace: filters.namespace,
      onlyAvailable: filters.onlyAvailable,
      onlyDefault: filters.onlyDefault,
    });

  const filteredTemplates = React.useMemo(
    () => filterTemplates(templates, filters),
    [templates, filters],
  );

  return (
    <Stack hasGutter className="vm-catalog">
      <TemplatesCatalogPageHeader namespace={namespace} />
      {loaded ? (
        <div className="co-catalog-page co-catalog-page--with-sidebar">
          <TemplatesCatalogFilters filters={filters} onFilterChange={onFilterChange} />
          <Stack className="co-catalog-page__content">
            <Toolbar inset={{ default: 'insetNone' }} isSticky>
              <ToolbarContent>
                <TemplatesCatalogHeader
                  itemCount={filteredTemplates.length}
                  filters={filters}
                  onFilterChange={onFilterChange}
                />
              </ToolbarContent>
            </Toolbar>
            {filteredTemplates?.length > 0 ? (
              <TemplatesCatalogItems
                templates={filteredTemplates}
                availableTemplatesUID={availableTemplatesUID}
                bootSourcesLoaded={bootSourcesLoaded}
                filters={filters}
                onTemplateClick={setSelectedTemplate}
                loaded={loaded}
                error={error}
              />
            ) : (
              <TemplatesCatalogEmptyState
                onClearFilters={clearAll}
                bootSourcesLoaded={bootSourcesLoaded}
              />
            )}
          </Stack>
        </div>
      ) : (
        skeletonCatalog
      )}
      <TemplatesCatalogDrawer
        namespace={namespace ?? 'default'}
        isOpen={!!selectedTemplate}
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(undefined)}
      />
    </Stack>
  );
};

export default TemplatesCatalog;
