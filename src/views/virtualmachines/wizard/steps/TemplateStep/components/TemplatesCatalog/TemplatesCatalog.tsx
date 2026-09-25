import { type FC, useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import TemplatesFilter from '@kubevirt-utils/components/TemplatesFilter/TemplatesFilter';
import { TemplatesFilterVariant } from '@kubevirt-utils/components/TemplatesFilter/types';
import { logTemplateFlowEvent, TEMPLATE_SELECTED } from '@kubevirt-utils/extensions/telemetry';
import { type Template } from '@kubevirt-utils/resources/template';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Card, Split, SplitItem } from '@patternfly/react-core';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';
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
    clusterPreferencesByName,
    filterDefinitions,
    filteredTemplates,
    filters,
    isList,
    loaded,
    namespace,
    onSetFilters,
    osDisplayNames,
    setIsList,
    setNamespace,
  } = useTemplatesCatalog();

  const { control, setValue } = useVMWizardForm();
  const { setIsTemplateDrawerOpen, setTemplateProcessError } = useVMWizardState();
  const selectedTemplate = useWatch({
    control,
    name: 'template.selectedTemplate',
  });

  const handleTemplateSelect = useCallback(
    (template: Template) => {
      const options = { shouldValidate: true } as const;
      setValue('template.selectedTemplate', template, options);
      setTemplateProcessError(null);
      setValue('template.lastProcessedKey', '');
      logTemplateFlowEvent(TEMPLATE_SELECTED, template);
      setIsTemplateDrawerOpen(true);
    },
    [setIsTemplateDrawerOpen, setTemplateProcessError, setValue],
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
              clusterPreferencesByName={clusterPreferencesByName}
              isList={isList}
              loaded={loaded}
              onTemplateClick={handleTemplateSelect}
              osDisplayNames={osDisplayNames}
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
