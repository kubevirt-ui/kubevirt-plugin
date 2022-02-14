import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { Gallery, Stack, StackItem, Title } from '@patternfly/react-core';

import { CatalogTemplateFilters } from './components/TemplatesCatalogFilters/CatalogTemplateFilters';
import { TemplatesCatalogHeader } from './components/TemplatesCatalogHeader';
import { skeletonCatalog } from './components/TemplatesCatalogSkeleton';
import { TemplateTile } from './components/TemplatesCatalogTile';
import { useVmTemplates } from './hooks/useVmTemplates';
import { useTemplatesFilters } from './hooks/useVmTemplatesFilters';
import { filterTemplates } from './utils/helpers';

import './TemplatesCatalog.scss';

const TemplatesCatalog: React.FC = () => {
  const { t } = useTranslation();
  const [isAdmin, isAdminLoaded] = useIsAdmin();

  const { templates, loaded: templatedLoaded } = useVmTemplates();
  const [filters, onFilterChange] = useTemplatesFilters(isAdmin);

  const filteredTemplates = React.useMemo(
    () => filterTemplates(templates, filters),
    [templates, filters],
  );

  const loaded = isAdminLoaded && templatedLoaded;

  return (
    <Stack>
      <StackItem className="co-m-nav-title co-m-nav-title--row">
        <Stack>
          <StackItem className="co-m-pane__heading">
            <Title headingLevel="h1">{t('Create VirtualMachine from template')}</Title>
          </StackItem>
          <StackItem>
            <StackItem>
              <Title headingLevel="h5" size="lg">
                {t('Select a template')}
              </Title>
            </StackItem>
            <StackItem className="vm-catalog-page-p">
              <Trans t={t} ns="plugin__kubevirt-plugin">
                You can filter the templates to reflect the current variety that is available in the
                cluster. Then select a template to start your VirtualMachine from. Some settings can
                be customized during the VirtualMachine creation flow.
              </Trans>
            </StackItem>
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
            <StackItem className="co-catalog-page__grid vm-catalog-grid-container">
              <Gallery hasGutter className="vm-catalog-grid">
                {filteredTemplates.map((tmp) => (
                  <TemplateTile
                    key={tmp?.metadata?.uid}
                    template={tmp}
                    onClick={(temp) => console.log('clicked', temp?.metadata?.name)}
                  />
                ))}
              </Gallery>
            </StackItem>
          </Stack>
        </div>
      ) : (
        skeletonCatalog
      )}
    </Stack>
  );
};

export default TemplatesCatalog;
