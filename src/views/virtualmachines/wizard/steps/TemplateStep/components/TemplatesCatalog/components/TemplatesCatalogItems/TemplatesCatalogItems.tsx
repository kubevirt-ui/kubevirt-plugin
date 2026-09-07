import React, { type FC, useMemo } from 'react';

import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getUID, type ResourceMap } from '@kubevirt-utils/resources/shared';
import { getTemplateName, sortTemplates, type Template } from '@kubevirt-utils/resources/template';
import { Gallery, StackItem } from '@patternfly/react-core';

import { getTemplateClusterPreference } from '../../../../utils/getTemplateClusterPreference';
import TemplatesTable from '../TemplatesTable/TemplatesTable';
import TemplatesCatalogTile from './components/TemplatesCatalogTile';

type TemplatesCatalogItemsProps = {
  availableDatasources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  bootSourcesLoaded: boolean;
  clusterPreferencesByName: ResourceMap<V1beta1VirtualMachineClusterPreference>;
  isList: boolean;
  loaded: boolean;
  onTemplateClick: (template: Template) => void;
  osDisplayNames: Record<string, string>;
  selectedTemplate?: Template;
  templates: Template[];
};

const TemplatesCatalogItems: FC<TemplatesCatalogItemsProps> = ({
  availableDatasources,
  availableTemplatesUID,
  bootSourcesLoaded,
  clusterPreferencesByName,
  isList,
  loaded,
  onTemplateClick,
  osDisplayNames,
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
        clusterPreferencesByName={clusterPreferencesByName}
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
            clusterPreference={getTemplateClusterPreference(template, clusterPreferencesByName)}
            isSelected={getUID(selectedTemplate) === getUID(template)}
            key={getUID(template) ?? getTemplateName(template)}
            onClick={onTemplateClick}
            osDisplayNames={osDisplayNames}
            template={template}
          />
        ))}
      </Gallery>
    </StackItem>
  );
};

export default TemplatesCatalogItems;
