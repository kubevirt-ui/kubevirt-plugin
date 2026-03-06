import React, { useMemo, VFC } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Gallery, StackItem } from '@patternfly/react-core';

import {
  getTemplateCatalogRowId,
  getTemplatesCatalogColumns,
  TemplatesCatalogCallbacks,
} from '../templatesCatalogTableDefinition';
import { TemplateFilters } from '../utils/types';

import { TemplateTile } from './TemplatesCatalogTile';

type TemplatesCatalogItemsProps = {
  availableDatasources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  bootSourcesLoaded: boolean;
  filters: TemplateFilters;
  loaded: boolean;
  onTemplateClick: (template: V1Template) => void;
  templates: V1Template[];
};

export const TemplatesCatalogItems: VFC<TemplatesCatalogItemsProps> = ({
  availableDatasources,
  availableTemplatesUID,
  bootSourcesLoaded,
  filters,
  loaded,
  onTemplateClick,
  templates,
}) => {
  const { t } = useKubevirtTranslation();
  const columns = useMemo(() => getTemplatesCatalogColumns(t), [t]);

  const sortedTemplates = useMemo(
    () =>
      [...templates].sort((a: V1Template, b: V1Template) =>
        (a?.metadata?.name ?? '').localeCompare(b?.metadata?.name ?? ''),
      ),
    [templates],
  );

  const callbacks: TemplatesCatalogCallbacks = useMemo(
    () => ({ availableDatasources, availableTemplatesUID, onTemplateClick }),
    [availableDatasources, availableTemplatesUID, onTemplateClick],
  );

  return filters?.isList ? (
    <div className="vm-catalog-table-container">
      <KubevirtTable
        ariaLabel={t('Templates catalog table')}
        callbacks={callbacks}
        columns={columns}
        data={templates}
        dataTest="templates-catalog-table"
        fixedLayout
        getRowId={getTemplateCatalogRowId}
        initialSortKey="name"
        loaded={loaded && bootSourcesLoaded}
        noDataEmptyText={t('No templates found')}
        unfilteredData={templates}
      />
    </div>
  ) : (
    <StackItem className="co-catalog-page__grid vm-catalog-grid-container">
      <Gallery className="vm-catalog-grid" hasGutter id="vm-catalog-grid">
        {sortedTemplates.map((template) => (
          <TemplateTile
            availableDatasources={availableDatasources}
            availableTemplatesUID={availableTemplatesUID}
            bootSourcesLoaded={bootSourcesLoaded}
            key={getTemplateCatalogRowId(template)}
            onClick={onTemplateClick}
            template={template}
          />
        ))}
      </Gallery>
    </StackItem>
  );
};
