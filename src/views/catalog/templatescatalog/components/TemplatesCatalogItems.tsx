import React, { useMemo, VFC } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Gallery, StackItem } from '@patternfly/react-core';

import useTemplatesCatalogColumns from '../hooks/useTemplatesCatalogColumns';
import { TemplateFilters } from '../hooks/useVmTemplatesFilters';

import { TemplatesCatalogRow } from './TemplatesCatalogRow';
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
  const columns = useTemplatesCatalogColumns();

  const sortedTemplates = useMemo(
    () =>
      templates.sort((a: V1Template, b: V1Template) =>
        a?.metadata?.name?.localeCompare(b?.metadata?.name),
      ),
    [templates],
  );

  return filters?.isList ? (
    <div className="vm-catalog-table-container">
      <VirtualizedTable
        columns={columns}
        data={templates}
        loaded={loaded && bootSourcesLoaded}
        loadError={null}
        Row={TemplatesCatalogRow}
        rowData={{ availableDatasources, availableTemplatesUID, onTemplateClick }}
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
            key={template?.metadata?.uid}
            onClick={onTemplateClick}
            template={template}
          />
        ))}
      </Gallery>
    </StackItem>
  );
};
