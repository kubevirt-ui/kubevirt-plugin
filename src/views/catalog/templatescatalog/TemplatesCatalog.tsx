import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Gallery, Stack, StackItem, Toolbar, ToolbarContent } from '@patternfly/react-core';

import { TemplatesCatalogDrawer } from './components/TemplatesCatalogDrawer/TemplatesCatalogDrawer';
import { TemplatesCatalogEmptyState } from './components/TemplatesCatalogEmptyState';
import { TemplatesCatalogFilters } from './components/TemplatesCatalogFilters/TemplatesCatalogFilters';
import { TemplatesCatalogHeader } from './components/TemplatesCatalogHeader';
import { TemplatesCatalogPageHeader } from './components/TemplatesCatalogPageHeader';
import { TemplatesCatalogRow } from './components/TemplatesCatalogRow';
import { skeletonCatalog } from './components/TemplatesCatalogSkeleton';
import { TemplateTile } from './components/TemplatesCatalogTile';
import { useAvailableSourceTemplates } from './hooks/useAvailableSourceTemplates';
import useTemplatesCatalogColumns from './hooks/useTemplatesCatalogColumns';
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
  const { templates, loaded, initialSourcesLoaded, error } = useAvailableSourceTemplates({
    namespace: filters.namespace,
    onlyAvailable: filters.onlyAvailable,
  });
  const columns = useTemplatesCatalogColumns();

  const filteredTemplates = React.useMemo(
    () => filterTemplates(templates, filters),
    [templates, filters],
  );

  const renderTemplates = React.useMemo(
    () =>
      filters?.isList ? (
        <div className="vm-catalog-table-container">
          <VirtualizedTable
            data={filteredTemplates}
            unfilteredData={filteredTemplates}
            loaded={loaded}
            loadError={error}
            columns={columns}
            Row={TemplatesCatalogRow}
            rowData={{ onTemplateClick: setSelectedTemplate }}
          />
        </div>
      ) : (
        <StackItem className="co-catalog-page__grid vm-catalog-grid-container">
          <Gallery hasGutter className="vm-catalog-grid" id="vm-catalog-grid">
            {filteredTemplates.map((template) => (
              <TemplateTile
                key={template?.metadata?.uid}
                template={template}
                onClick={setSelectedTemplate}
              />
            ))}
          </Gallery>
        </StackItem>
      ),
    [columns, error, filteredTemplates, filters?.isList, loaded],
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
              <>{renderTemplates}</>
            ) : (
              <TemplatesCatalogEmptyState
                loadingSources={filters?.onlyAvailable && !initialSourcesLoaded}
                onClearFilters={clearAll}
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
