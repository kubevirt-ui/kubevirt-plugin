import React, { FC, useMemo } from 'react';

import { modelToRef, TemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import TemplatesFilter from '@kubevirt-utils/components/TemplatesFilter/TemplatesFilter';
import { TemplatesFilterVariant } from '@kubevirt-utils/components/TemplatesFilter/types';
import useFiltersFromURL from '@kubevirt-utils/hooks/useFiltersFromURL';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useSelectedRowFilterClusters from '@kubevirt-utils/hooks/useSelectedRowFilterClusters';
import useSelectedRowFilterProjects from '@kubevirt-utils/hooks/useSelectedRowFilterProjects';
import { TemplateOrRequest } from '@kubevirt-utils/resources/template/utils';
import { ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import {
  ListPageBody,
  ListPageHeader,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';

import VirtualMachineTemplatesCreateButton from './components/VirtualMachineTemplatesCreateButton/VirtualMachineTemplatesCreateButton';
import VirtualMachineTemplatesEmptyState from './components/VirtualMachineTemplatesEmptyState/VirtualMachineTemplatesEmptyState';
import useVirtualMachineTemplatesFilters from './filters/useVirtualMachineTemplatesFilters';
import useAllTemplateResources from './hooks/useAllTemplateResources';
import { getTemplateColumns, getTemplateRowId } from './virtualMachineTemplatesDefinition';

import '@kubevirt-utils/styles/list-managment-group.scss';

const VirtualMachineTemplatesList: FC<ListPageProps> = ({
  fieldSelector,
  hideColumnManagement,
  hideNameLabelFilters,
  hideTextFilter,
  nameFilter,
  selector,
  showTitle = true,
}) => {
  const selectedClusters = useSelectedRowFilterClusters();
  const selectedProjects = useSelectedRowFilterProjects();
  const namespaceParam = useNamespaceParam();
  const isAllClustersPage = useIsAllClustersPage();

  const { t } = useKubevirtTranslation();

  const { allTemplates, allTemplatesWithRequests, error, loaded } = useAllTemplateResources({
    fieldSelector,
    namespace: namespaceParam,
    selector,
  });

  const { filters, filtersWithSelect } = useVirtualMachineTemplatesFilters(allTemplates);

  const allFilters = useMemo(
    () => [...filters, ...filtersWithSelect],
    [filters, filtersWithSelect],
  );

  const filtersFromURL = useFiltersFromURL(allFilters);

  const staticFilters = useMemo(
    () => ({
      ...filtersFromURL,
      ...(nameFilter && { name: { selected: [nameFilter] } }),
    }),
    [filtersFromURL, nameFilter],
  );

  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter(
    allTemplatesWithRequests,
    allFilters,
    staticFilters,
  );

  const columns = useMemo(
    () => getTemplateColumns(t, namespaceParam, isAllClustersPage),
    [t, namespaceParam, isAllClustersPage],
  );

  const manageableColumns = useMemo(() => columns.filter((col) => col.label), [columns]);

  const [activeColumns, , loadedColumns] = useKubevirtUserSettingsTableColumns<TemplateOrRequest>({
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

  if (
    loaded &&
    !error &&
    isEmpty(unfilteredData) &&
    isEmpty(selectedClusters) &&
    isEmpty(selectedProjects)
  ) {
    return <VirtualMachineTemplatesEmptyState />;
  }

  return (
    <>
      <ListPageHeader title={showTitle && t('Templates')}>
        <VirtualMachineTemplatesCreateButton />
      </ListPageHeader>
      <ListPageBody>
        <div className="list-managment-group">
          <ListPageFilter
            customRowFiltersMenu={
              <TemplatesFilter
                onFilterChange={onFilterChange}
                rowFilters={filters}
                variant={TemplatesFilterVariant.Menu}
              />
            }
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
        <KubevirtTable<TemplateOrRequest>
          activeColumnKeys={activeColumnKeys}
          ariaLabel={t('Templates table')}
          columns={columns}
          data={filteredData}
          getRowId={getTemplateRowId}
          initialSortKey="none" // TODO: not clean, fix later
          loaded={loaded && loadedColumns}
          loadError={error}
          noFilteredDataMsg={t('No templates found')}
          unfilteredData={unfilteredData}
        />
      </ListPageBody>
    </>
  );
};

export default VirtualMachineTemplatesList;
