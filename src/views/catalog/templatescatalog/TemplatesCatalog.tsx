import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Gallery, Stack, StackItem, Title } from '@patternfly/react-core';

import { TemplatesCatalogDrawer } from './components/TemplatesCatalogDrawer/TemplatesCatalogDrawer';
import { TemplatesCatalogEmptyState } from './components/TemplatesCatalogEmptyState';
import { TemplatesCatalogFilters } from './components/TemplatesCatalogFilters/TemplatesCatalogFilters';
import { TemplatesCatalogHeader } from './components/TemplatesCatalogHeader';
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
  const { t } = useKubevirtTranslation();
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
        <VirtualizedTable
          data={filteredTemplates}
          unfilteredData={filteredTemplates}
          loaded={loaded}
          loadError={error}
          columns={columns}
          Row={TemplatesCatalogRow}
          rowData={{ onTemplateClick: setSelectedTemplate }}
        />
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
    <Stack hasGutter>
      <StackItem className="co-m-nav-title co-m-nav-title--row">
        <Stack>
          <StackItem className="co-m-pane__heading">
            <Title headingLevel="h1">{t('Create new VirtualMachine from catalog')}</Title>
          </StackItem>
          <StackItem>{t('Select an option to create a VirtualMachine')}</StackItem>
        </Stack>
      </StackItem>
      {loaded ? (
        <div className="co-catalog-page co-catalog-page--with-sidebar">
          <TemplatesCatalogFilters filters={filters} onFilterChange={onFilterChange} />
          <Stack className="co-catalog-page__content">
            <StackItem>
              <TemplatesCatalogHeader
                itemCount={filteredTemplates.length}
                filters={filters}
                onFilterChange={onFilterChange}
              />
            </StackItem>
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
