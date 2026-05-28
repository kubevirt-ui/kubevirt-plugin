import React, { FC, useMemo } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { getUID } from '@kubevirt-utils/resources/shared';
import { getTemplateName, sortTemplates, Template } from '@kubevirt-utils/resources/template';
import { Gallery, StackItem } from '@patternfly/react-core';

import TemplatesTable from '../TemplatesTable/TemplatesTable';

import TemplatesCatalogTile from './components/TemplatesCatalogTile';

type TemplatesCatalogItemsProps = {
  availableDatasources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  bootSourcesLoaded: boolean;
  isList: boolean;
  loaded: boolean;
  onTemplateClick: (template: Template) => void;
  selectedTemplate?: Template;
  templates: Template[];
};

const TemplatesCatalogItems: FC<TemplatesCatalogItemsProps> = ({
  availableDatasources,
  availableTemplatesUID,
  bootSourcesLoaded,
  isList,
  loaded,
  onTemplateClick,
  selectedTemplate,
  templates,
}) => {
  const sortedTemplates = useMemo(() => sortTemplates(templates), [templates]);

  return isList ? (
    <div className="vm-catalog-table-container">
      <TemplatesTable
        availableDatasources={availableDatasources}
        availableTemplatesUID={availableTemplatesUID}
        bootSourcesLoaded={bootSourcesLoaded}
        loaded={loaded}
        onTemplateClick={onTemplateClick}
        templates={sortedTemplates}
      />
    </div>
  ) : (
    <StackItem className="co-catalog-page__grid vm-catalog-grid-container">
      <Gallery className="vm-catalog-grid" hasGutter id="vm-catalog-grid">
        {sortedTemplates.map((template) => (
          <TemplatesCatalogTile
            isSelected={getUID(selectedTemplate) === getUID(template)}
            key={getUID(template) ?? getTemplateName(template)}
            onClick={onTemplateClick}
            template={template}
          />
        ))}
      </Gallery>
    </StackItem>
  );
};

export default TemplatesCatalogItems;
