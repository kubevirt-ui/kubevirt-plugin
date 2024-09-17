import React, { FC } from 'react';

import { modelToRef, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';

import VirtualMachineTemplatesCreateButton from './components/VirtualMachineTemplatesCreateButton/VirtualMachineTemplatesCreateButton';
import VirtualMachineTemplatesEmptyState from './components/VirtualMachineTemplatesEmptyState/VirtualMachineTemplatesEmptyState';
import VirtualMachineTemplatesRow from './components/VirtualMachineTemplatesRow';
import VirtualMachineTemplateSupport from './components/VirtualMachineTemplateSupport/VirtualMachineTemplateSupport';
import useHideDeprecatedTemplates from './hooks/useHideDeprecatedTemplates';
import { useTemplatesWithAvailableSource } from './hooks/useTemplatesWithAvailableSource';
import useVirtualMachineTemplatesColumns from './hooks/useVirtualMachineTemplatesColumns';
import useVirtualMachineTemplatesFilters from './hooks/useVirtualMachineTemplatesFilters';

const VirtualMachineTemplatesList: FC<ListPageProps> = ({
  fieldSelector,
  hideColumnManagement,
  hideNameLabelFilters,
  hideTextFilter,
  nameFilter,
  namespace,
  selector,
  showTitle,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    availableDatasources,
    availableTemplatesUID,
    bootSourcesLoaded,
    cloneInProgressDatasources,
    error,
    loaded,
    templates,
  } = useTemplatesWithAvailableSource({
    fieldSelector,
    namespace,
    onlyAvailable: false,
    onlyDefault: false,
    selector,
  });
  const filters = useVirtualMachineTemplatesFilters(availableTemplatesUID);
  const [data, filteredData, onFilterChange] = useListPageFilter(templates, filters, {
    name: { selected: [nameFilter] },
  });

  const [columns, activeColumns, loadedColumns] = useVirtualMachineTemplatesColumns(namespace);

  const templatesLoaded = loaded && bootSourcesLoaded;

  useHideDeprecatedTemplates(onFilterChange);

  if (templatesLoaded && isEmpty(data)) {
    return <VirtualMachineTemplatesEmptyState namespace={namespace} />;
  }

  return (
    <>
      <ListPageHeader title={!(showTitle === false) && t('VirtualMachine Templates')}>
        <VirtualMachineTemplatesCreateButton namespace={namespace} />
      </ListPageHeader>
      <ListPageBody>
        <Stack hasGutter>
          <StackItem>
            <VirtualMachineTemplateSupport />
          </StackItem>
          <StackItem>
            <ListPageFilter
              columnLayout={{
                columns: columns?.map(({ additional, id, title }) => ({
                  additional,
                  id,
                  title,
                })),
                id: modelToRef(TemplateModel),
                selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
                type: t('Template'),
              }}
              data={data}
              hideColumnManagement={hideColumnManagement}
              hideLabelFilter={hideTextFilter}
              hideNameLabelFilters={hideNameLabelFilters}
              loaded={templatesLoaded && loadedColumns}
              onFilterChange={onFilterChange}
              rowFilters={filters}
            />
            <VirtualizedTable<
              K8sResourceCommon,
              {
                availableDatasources: Record<string, V1beta1DataSource>;
                availableTemplatesUID: Set<string>;
                cloneInProgressDatasources: Record<string, V1beta1DataSource>;
              }
            >
              EmptyMsg={() => (
                <div className="pf-u-text-align-center" id="no-templates-msg">
                  {t('No templates found')}
                </div>
              )}
              columns={activeColumns}
              data={filteredData}
              loaded={templatesLoaded && loadedColumns}
              loadError={error}
              Row={VirtualMachineTemplatesRow}
              rowData={{ availableDatasources, availableTemplatesUID, cloneInProgressDatasources }}
              unfilteredData={data}
            />
          </StackItem>
        </Stack>
      </ListPageBody>
    </>
  );
};

export default VirtualMachineTemplatesList;
