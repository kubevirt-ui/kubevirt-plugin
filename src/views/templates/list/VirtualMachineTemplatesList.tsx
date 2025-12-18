import React, { FC, useMemo } from 'react';

import { modelToRef, TemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useSelectedRowFilterClusters from '@kubevirt-utils/hooks/useSelectedRowFilterClusters';
import useSelectedRowFilterProjects from '@kubevirt-utils/hooks/useSelectedRowFilterProjects';
import { ClusterNamespacedResourceMap } from '@kubevirt-utils/resources/shared';
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
  selector,
  showTitle,
}) => {
  const selectedClusters = useSelectedRowFilterClusters();
  const selectedProjects = useSelectedRowFilterProjects();
  const namespaceParam = useNamespaceParam();

  const { t } = useKubevirtTranslation();
  const {
    availableDataSources,
    availableTemplatesUID,
    bootSourcesLoaded,
    cloneInProgressDataSources,
    error,
    loaded,
    templates,
  } = useTemplatesWithAvailableSource({
    fieldSelector,
    namespace: namespaceParam,
    onlyAvailable: false,
    onlyDefault: false,
    selector,
  });

  const { filters, filtersWithSelect } = useVirtualMachineTemplatesFilters(availableTemplatesUID);

  const allFilters = useMemo(
    () => [...filters, ...filtersWithSelect],
    [filters, filtersWithSelect],
  );

  const [data, filteredData, onFilterChange] = useListPageFilter(templates, allFilters, {
    name: { selected: [nameFilter] },
  });

  const [columns, activeColumns, loadedColumns] = useVirtualMachineTemplatesColumns(namespaceParam);

  const templatesLoaded = loaded && bootSourcesLoaded;

  useHideDeprecatedTemplates(onFilterChange);

  if (templatesLoaded && isEmpty(data) && isEmpty(selectedClusters) && isEmpty(selectedProjects)) {
    return <VirtualMachineTemplatesEmptyState />;
  }

  return (
    <>
      <ListPageHeader title={!(showTitle === false) && t('VirtualMachine Templates')}>
        <VirtualMachineTemplatesCreateButton />
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
              filtersWithSelect={filtersWithSelect}
              hideColumnManagement={hideColumnManagement}
              hideLabelFilter={hideTextFilter}
              hideNameLabelFilters={hideNameLabelFilters}
              loaded={loadedColumns}
              onFilterChange={onFilterChange}
              rowFilters={filters}
            />
            <VirtualizedTable<
              K8sResourceCommon,
              {
                availableDataSources: ClusterNamespacedResourceMap<V1beta1DataSource>;
                availableTemplatesUID: Set<string>;
                cloneInProgressDataSources: ClusterNamespacedResourceMap<V1beta1DataSource>;
              }
            >
              EmptyMsg={() => (
                <div className="pf-v6-u-text-align-center" id="no-templates-msg">
                  {t('No templates found')}
                </div>
              )}
              columns={activeColumns}
              data={filteredData}
              loaded={templatesLoaded && loadedColumns}
              loadError={error}
              Row={VirtualMachineTemplatesRow}
              rowData={{ availableDataSources, availableTemplatesUID, cloneInProgressDataSources }}
              unfilteredData={data}
            />
          </StackItem>
        </Stack>
      </ListPageBody>
    </>
  );
};

export default VirtualMachineTemplatesList;
