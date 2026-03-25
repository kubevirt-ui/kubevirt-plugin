import React, { FC, useMemo } from 'react';

import { modelToRef, TemplateModel, V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useSelectedRowFilterClusters from '@kubevirt-utils/hooks/useSelectedRowFilterClusters';
import useSelectedRowFilterProjects from '@kubevirt-utils/hooks/useSelectedRowFilterProjects';
import { ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import {
  ListPageBody,
  ListPageHeader,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';

import VirtualMachineTemplatesCreateButton from './components/VirtualMachineTemplatesCreateButton/VirtualMachineTemplatesCreateButton';
import VirtualMachineTemplatesEmptyState from './components/VirtualMachineTemplatesEmptyState/VirtualMachineTemplatesEmptyState';
import VirtualMachineTemplateSupport from './components/VirtualMachineTemplateSupport/VirtualMachineTemplateSupport';
import useHideDeprecatedTemplates from './hooks/useHideDeprecatedTemplates';
import { useTemplatesWithAvailableSource } from './hooks/useTemplatesWithAvailableSource';
import useVirtualMachineTemplatesFilters from './hooks/useVirtualMachineTemplatesFilters';
import {
  getTemplateColumns,
  getTemplateRowId,
  TEMPLATE_COLUMN_KEYS,
  TemplateCallbacks,
} from './virtualMachineTemplatesDefinition';

import '@kubevirt-utils/styles/list-managment-group.scss';

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
  const isAllClustersPage = useIsAllClustersPage();

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

  const { filters, filtersWithSelect } = useVirtualMachineTemplatesFilters(
    availableTemplatesUID,
    templates,
  );

  const allFilters = useMemo(
    () => [...filters, ...filtersWithSelect],
    [filters, filtersWithSelect],
  );

  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter(templates, allFilters, {
    name: { selected: [nameFilter] },
  });

  const columns = useMemo(
    () => getTemplateColumns(t, namespaceParam, isAllClustersPage),
    [t, namespaceParam, isAllClustersPage],
  );

  const manageableColumns = useMemo(() => columns.filter((col) => col.label), [columns]);

  const [activeColumns, , loadedColumns] = useKubevirtUserSettingsTableColumns<V1Template>({
    columnManagementID: modelToRef(TemplateModel),
    columns: manageableColumns.map((col) => ({
      additional: col.additional,
      id: col.key,
      props: col.props,
      title: col.label,
    })),
  });

  const activeColumnKeys = useMemo(
    () => activeColumns?.map((col) => col?.id) ?? manageableColumns.map((col) => col.key),
    [activeColumns, manageableColumns],
  );

  const columnLayout = useMemo(
    () => buildColumnLayout(manageableColumns, activeColumnKeys, modelToRef(TemplateModel)),
    [manageableColumns, activeColumnKeys],
  );

  const templatesLoaded = loaded && bootSourcesLoaded;

  useHideDeprecatedTemplates(onFilterChange);

  const callbacks: TemplateCallbacks = useMemo(
    () => ({
      availableDataSources,
      availableTemplatesUID,
      cloneInProgressDataSources,
    }),
    [availableDataSources, availableTemplatesUID, cloneInProgressDataSources],
  );

  if (
    templatesLoaded &&
    isEmpty(unfilteredData) &&
    isEmpty(selectedClusters) &&
    isEmpty(selectedProjects)
  ) {
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
            <div className="list-managment-group">
              <ListPageFilter
                columnLayout={columnLayout}
                data={unfilteredData}
                filtersWithSelect={filtersWithSelect}
                hideColumnManagement={hideColumnManagement}
                hideLabelFilter={hideTextFilter}
                hideNameLabelFilters={hideNameLabelFilters}
                loaded={loadedColumns}
                onFilterChange={onFilterChange}
                rowFilters={filters}
              />
            </div>
            <KubevirtTable<V1Template, TemplateCallbacks>
              activeColumnKeys={activeColumnKeys}
              ariaLabel={t('VirtualMachine Templates table')}
              callbacks={callbacks}
              columns={columns}
              data={filteredData}
              getRowId={getTemplateRowId}
              initialSortKey={TEMPLATE_COLUMN_KEYS.name}
              loaded={templatesLoaded && loadedColumns}
              loadError={error}
              noFilteredDataMsg={t('No templates found')}
              unfilteredData={unfilteredData}
            />
          </StackItem>
        </Stack>
      </ListPageBody>
    </>
  );
};

export default VirtualMachineTemplatesList;
