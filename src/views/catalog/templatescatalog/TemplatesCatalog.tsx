import * as React from 'react';
import { Trans } from 'react-i18next';
import { RouteComponentProps } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Gallery, Stack, StackItem, Title } from '@patternfly/react-core';

import { TemplatesCatalogDrawer } from './components/TemplatesCatalogDrawer/TemplatesCatalogDrawer';
import { TemplatesCatalogEmptyState } from './components/TemplatesCatalogEmptyState';
import { CatalogTemplateFilters } from './components/TemplatesCatalogFilters/CatalogTemplateFilters';
import { TemplatesCatalogHeader } from './components/TemplatesCatalogHeader';
import { TemplatesCatalogLoadingSources } from './components/TemplatesCatalogLoadingSources';
import { skeletonCatalog } from './components/TemplatesCatalogSkeleton';
import { TemplateTile } from './components/TemplatesCatalogTile';
import { useTemplatesFilters } from './hooks/useVmTemplatesFilters';
import { useVmTemplatesWithAvailableSource } from './hooks/useVmTemplatesWithAvailableSource';
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
  const { templates, loaded, templatesWithSourceLoaded } = useVmTemplatesWithAvailableSource(
    filters?.tabView === 'onlyAvailable',
  );

  const filteredTemplates = React.useMemo(
    () => filterTemplates(templates, filters),
    [templates, filters],
  );

  const isLoadingAvailableSources =
    filters.tabView === 'onlyAvailable' && !templatesWithSourceLoaded;

  return (
    <Stack hasGutter>
      <StackItem className="co-m-nav-title co-m-nav-title--row">
        <Stack>
          <StackItem className="co-m-pane__heading">
            <Title headingLevel="h1">{t('Create new VirtualMachine from catalog')}</Title>
          </StackItem>
          <StackItem>
            <Trans t={t} ns="plugin__kubevirt-plugin">
              Select an option to create a VirtualMachine
            </Trans>
          </StackItem>
        </Stack>
      </StackItem>
      {loaded ? (
        <div className="co-catalog-page co-catalog-page--with-sidebar">
          <CatalogTemplateFilters filters={filters} onFilterChange={onFilterChange} />
          <Stack className="co-catalog-page__content">
            <StackItem>
              <TemplatesCatalogHeader
                itemCount={filteredTemplates.length}
                filters={filters}
                onFilterChange={onFilterChange}
              />
            </StackItem>
            {isLoadingAvailableSources ? (
              <TemplatesCatalogLoadingSources />
            ) : filteredTemplates.length === 0 ? (
              <TemplatesCatalogEmptyState onClearFilters={clearAll} />
            ) : (
              <StackItem className="co-catalog-page__grid vm-catalog-grid-container">
                <Gallery hasGutter className="vm-catalog-grid">
                  {filteredTemplates.map((template) => (
                    <TemplateTile
                      key={template?.metadata?.uid}
                      template={template}
                      onClick={setSelectedTemplate}
                    />
                  ))}
                </Gallery>
              </StackItem>
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
