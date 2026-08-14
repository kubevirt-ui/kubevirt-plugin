import React, { FC, useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import TemplatesFilter from '@kubevirt-utils/components/TemplatesFilter/TemplatesFilter';
import { TemplatesFilterVariant } from '@kubevirt-utils/components/TemplatesFilter/types';
import { logTemplateFlowEvent, TEMPLATE_SELECTED } from '@kubevirt-utils/extensions/telemetry';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Card, Split, SplitItem } from '@patternfly/react-core';
import { Template } from '@kubevirt-utils/resources/template';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_UI_STATE,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import TemplatesCatalogEmptyState from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesCatalogEmptyState';
import TemplatesCatalogItems from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesCatalogItems/TemplatesCatalogItems';
import CatalogSkeleton from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesCatalogSkeleton';
import TemplatesToolbar from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesToolbar/TemplatesToolbar';

import useTemplatesCatalog from './hooks/useTemplatesCatalog';

import './TemplateCatalog.scss';

const TemplatesCatalog: FC = () => {
  const {
    availableDataSources,
    availableTemplatesUID,
    bootSourcesLoaded,
    clearAll,
    filterDefinitions,
    filteredTemplates,
    filters,
    isList,
    loaded,
    namespace,
    onSetFilters,
    setIsList,
    setNamespace,
  } = useTemplatesCatalog();

  const { control, setValue } = useVMWizard();
  const selectedTemplate = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_VM_DATA.SELECTED_TEMPLATE,
  });

  const handleTemplateSelect = useCallback(
    (template: Template) => {
      setValue(CREATE_VM_FORM_FIELDS_VM_DATA.SELECTED_TEMPLATE, template);
      setValue(CREATE_VM_FORM_FIELDS_UI_STATE.TEMPLATE_PROCESS_ERROR, null);
      setValue(CREATE_VM_FORM_FIELDS_UI_STATE.LAST_PROCESSED_TEMPLATE_KEY, '');
      logTemplateFlowEvent(TEMPLATE_SELECTED, template);
      setValue(CREATE_VM_FORM_FIELDS_UI_STATE.IS_TEMPLATES_DRAWER_OPEN, true);
    },
    [setValue],
  );

  if (!loaded) {
    return <CatalogSkeleton />;
  }

  return (
    <Card className="vm-catalog">
      <TemplatesToolbar
        filters={filters}
        isList={isList}
        namespace={namespace}
        onSetFilters={onSetFilters}
        setIsList={setIsList}
        setNamespace={setNamespace}
      />
      <Split className="co-catalog-page__content">
        <SplitItem className="pf-v6-u-flex-shrink-0">
          <TemplatesFilter
            filterDefinitions={filterDefinitions}
            filters={filters}
            onSetFilters={onSetFilters}
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
  );
};

export default TemplatesCatalog;
