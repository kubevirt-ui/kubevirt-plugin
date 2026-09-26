import { type FC } from 'react';

import GuidedTour from '@kubevirt-utils/components/GuidedTour/GuidedTour';
import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { getK8sRowId } from '@kubevirt-utils/components/KubevirtTable/utils';
import TemplatesFilter from '@kubevirt-utils/components/TemplatesFilter/TemplatesFilter';
import { TemplatesFilterVariant } from '@kubevirt-utils/components/TemplatesFilter/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useSelectedRowFilterClusters from '@kubevirt-utils/hooks/useSelectedRowFilterClusters';
import useSelectedRowFilterProjects from '@kubevirt-utils/hooks/useSelectedRowFilterProjects';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import { type TemplateOrRequest } from '@kubevirt-utils/resources/template/utils';
import { type ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { ToolbarItem } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';

import TemplatesTypeToggle from './components/TemplatesTypeToggle/TemplatesTypeToggle';
import VirtualMachineTemplatesCreateButton from './components/VirtualMachineTemplatesCreateButton/VirtualMachineTemplatesCreateButton';
import VirtualMachineTemplatesEmptyState from './components/VirtualMachineTemplatesEmptyState/VirtualMachineTemplatesEmptyState';
import useAllTemplateResources from './hooks/useAllTemplateResources';
import useVirtualMachineTemplatesListColumns from './hooks/useVirtualMachineTemplatesListColumns';
import useVirtualMachineTemplatesListFilters from './hooks/useVirtualMachineTemplatesListFilters';

import '@kubevirt-utils/styles/list-managment-group.scss';

const VirtualMachineTemplatesList: FC<ListPageProps> = ({
  fieldSelector,
  hideColumnManagement,
  hideNameLabelFilters,
  hideTextFilter,
  namespace,
  selector,
  showTitle = true,
}) => {
  useSignals();
  const { t } = useKubevirtTranslation();
  const selectedClusters = useSelectedRowFilterClusters();
  const selectedProjects = useSelectedRowFilterProjects();
  const namespaceParam = useNamespaceParam();
  const isAllClustersPage = useIsAllClustersPage();

  // Prefer the namespace passed down by Console over the one parsed from the URL,
  // since useNamespaceParam only matches /k8s/ns/:ns/* and the fleet path.
  const activeNamespace = namespace ?? namespaceParam;

  const { allTemplates, allTemplatesWithRequests, error, loaded } = useAllTemplateResources({
    fieldSelector,
    namespace: activeNamespace,
    selector,
  });

  const {
    clearAllFilters,
    filterDefinitions,
    filteredData,
    filters,
    onSetFilters,
    toolbarFilterDefinitions,
  } = useVirtualMachineTemplatesListFilters(allTemplates, allTemplatesWithRequests);

  const { activeColumnKeys, columnLayout, columns, loadedColumns } =
    useVirtualMachineTemplatesListColumns(activeNamespace, isAllClustersPage);

  if (
    !runningTourSignal.value &&
    loaded &&
    !error &&
    isEmpty(allTemplatesWithRequests) &&
    isEmpty(selectedClusters) &&
    isEmpty(selectedProjects)
  ) {
    return <VirtualMachineTemplatesEmptyState />;
  }

  return (
    <>
      <GuidedTour />
      <ListPageHeader title={showTitle && t('Templates')}>
        <VirtualMachineTemplatesCreateButton />
      </ListPageHeader>
      <ListPageBody>
        <div className="list-managment-group">
          <KubevirtFilterToolbar
            clearAllFilters={clearAllFilters}
            columnLayout={columnLayout}
            customFilterMenu={
              <TemplatesFilter
                filterDefinitions={filterDefinitions}
                filters={filters}
                onSetFilters={onSetFilters}
                variant={TemplatesFilterVariant.Menu}
              />
            }
            data={allTemplatesWithRequests}
            filterDefinitions={toolbarFilterDefinitions}
            filters={filters}
            hideColumnManagement={hideColumnManagement}
            hideLabelFilter={hideTextFilter || hideNameLabelFilters}
            loaded={loadedColumns}
            onSetFilters={onSetFilters}
            toolbarEndContent={
              <KubevirtTableExport
                activeColumnKeys={activeColumnKeys}
                asToolbarItem
                columns={columns}
                data={filteredData ?? []}
                exportKey={EXPORT_TABLE_KEYS.TEMPLATES}
                initialSortKey="none"
                loaded={loaded && loadedColumns}
              />
            }
            toolbarStartContent={
              <ToolbarItem>
                <TemplatesTypeToggle filters={filters} onSetFilters={onSetFilters} />
              </ToolbarItem>
            }
          />
        </div>
        <KubevirtTable<TemplateOrRequest>
          activeColumnKeys={activeColumnKeys}
          ariaLabel={t('Templates table')}
          columns={columns}
          data={filteredData}
          getRowId={getK8sRowId}
          initialSortKey="none"
          loaded={loaded && loadedColumns}
          loadError={error}
          noFilteredDataMsg={t('No templates found')}
          persistSortInUrl
          unfilteredData={allTemplatesWithRequests}
        />
      </ListPageBody>
    </>
  );
};

export default VirtualMachineTemplatesList;
