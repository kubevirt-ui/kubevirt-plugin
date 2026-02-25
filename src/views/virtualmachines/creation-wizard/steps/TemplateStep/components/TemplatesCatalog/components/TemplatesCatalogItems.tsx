import React, { useMemo, VFC } from 'react';

import {
  getTemplateCatalogRowId,
  getTemplatesCatalogColumns,
} from '@catalog/templatescatalog/templatesCatalogTableDefinition';
import { TemplatesCatalogCallbacks } from '@catalog/templatescatalog/types';
import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateName } from '@kubevirt-utils/resources/template';
import { Gallery, StackItem } from '@patternfly/react-core';

import { TemplateFilters } from '../utils/types';

import TemplatesCatalogTile from './TemplatesCatalogTile';

type TemplatesCatalogItemsProps = {
  availableDatasources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  bootSourcesLoaded: boolean;
  filters: TemplateFilters;
  loaded: boolean;
  onTemplateClick: (template: V1Template) => void;
  templates: V1Template[];
  unfilteredTemplates: V1Template[];
};

const TemplatesCatalogItems: VFC<TemplatesCatalogItemsProps> = ({
  availableDatasources,
  availableTemplatesUID,
  bootSourcesLoaded,
  filters,
  loaded,
  onTemplateClick,
  templates,
  unfilteredTemplates,
}) => {
  const { t } = useKubevirtTranslation();
  const columns = useMemo(() => getTemplatesCatalogColumns(t), [t]);

  const sortedTemplates = useMemo(
    () =>
      [...templates].sort((a: V1Template, b: V1Template) =>
        (getTemplateName(a) ?? '').localeCompare(getTemplateName(b) ?? ''),
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
        noDataMsg={t('No templates found')}
        unfilteredData={unfilteredTemplates}
      />
    </div>
  ) : (
    <StackItem className="co-catalog-page__grid vm-catalog-grid-container">
      <Gallery className="vm-catalog-grid" hasGutter id="vm-catalog-grid">
        {sortedTemplates.map((template) => (
          <TemplatesCatalogTile
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

export default TemplatesCatalogItems;
