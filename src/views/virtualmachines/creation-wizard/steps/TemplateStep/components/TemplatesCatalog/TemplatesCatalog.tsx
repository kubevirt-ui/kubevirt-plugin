import React, { FC } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useApplyFiltersWithQuery } from '@kubevirt-utils/components/ListPageFilter/hooks/useApplyFiltersWithQuery';
import TemplatesFilter from '@kubevirt-utils/components/TemplatesFilter/TemplatesFilter';
import { TemplatesFilterVariant } from '@kubevirt-utils/components/TemplatesFilter/types';
import { logTemplateFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import { TEMPLATE_SELECTED } from '@kubevirt-utils/extensions/telemetry/utils/constants';
import useFiltersFromURL from '@kubevirt-utils/hooks/useFiltersFromURL';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Card, Split, SplitItem } from '@patternfly/react-core';
import useVirtualMachineTemplatesFilters from '@templates/list/filters/useVirtualMachineTemplatesFilters';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import TemplatesCatalogEmptyState from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesCatalogEmptyState';
import TemplatesCatalogItems from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesCatalogItems/TemplatesCatalogItems';
import CatalogSkeleton from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesCatalogSkeleton';
import TemplatesToolbar from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesToolbar/TemplatesToolbar';
import useTemplatesWithAvailableSource from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/hooks/useTemplatesWithAvailableSource/useTemplatesWithAvailableSource';

import useCatalogUIState from './hooks/useCatalogUIState';

import './TemplateCatalog.scss';

const TemplatesCatalog: FC = () => {
  const { selectedTemplate, setSelectedTemplate, setTemplatesDrawerIsOpen } = useVMWizardStore();
  const { isList, namespace, setIsList, setNamespace } = useCatalogUIState();

  const { availableDataSources, availableTemplatesUID, bootSourcesLoaded, loaded, templates } =
    useTemplatesWithAvailableSource({ namespace });

  const { filters } = useVirtualMachineTemplatesFilters(templates);
  const filtersFromURL = useFiltersFromURL(filters);
  const [, filteredTemplates, onFilterChange] = useListPageFilter(
    templates,
    filters,
    filtersFromURL,
  );

  const applyFiltersWithQuery = useApplyFiltersWithQuery(onFilterChange);

  const handleTemplateSelect = (template: V1Template) => {
    setSelectedTemplate(template);
    const vm = getTemplateVirtualMachineObject(template);
    vmSignal.value = vm;
    logTemplateFlowEvent(TEMPLATE_SELECTED, template);
    setTemplatesDrawerIsOpen(true);
  };

  const clearAll = () => {
    filters.forEach((rf) => {
      applyFiltersWithQuery(rf.type, []);
    });
    applyFiltersWithQuery('name', []);
  };

  return loaded ? (
    <Card className="vm-catalog">
      <TemplatesToolbar
        isList={isList}
        namespace={namespace}
        onFilterChange={onFilterChange}
        setIsList={setIsList}
        setNamespace={setNamespace}
      />
      <Split className="co-catalog-page__content">
        <SplitItem className="pf-v6-u-flex-shrink-0">
          <TemplatesFilter
            onFilterChange={onFilterChange}
            rowFilters={filters}
            variant={TemplatesFilterVariant.Sidebar}
          />
        </SplitItem>
        <SplitItem isFilled>
          {!isEmpty(filteredTemplates) ? (
            <TemplatesCatalogItems
              availableDatasources={availableDataSources}
              availableTemplatesUID={availableTemplatesUID}
              bootSourcesLoaded={bootSourcesLoaded}
              isList={isList}
              loaded={loaded}
              onTemplateClick={handleTemplateSelect}
              selectedTemplate={selectedTemplate}
              templates={filteredTemplates}
            />
          ) : (
            <TemplatesCatalogEmptyState
              bootSourcesLoaded={bootSourcesLoaded}
              onClearFilters={clearAll}
            />
          )}
        </SplitItem>
      </Split>
    </Card>
  ) : (
    <CatalogSkeleton />
  );
};

export default TemplatesCatalog;
