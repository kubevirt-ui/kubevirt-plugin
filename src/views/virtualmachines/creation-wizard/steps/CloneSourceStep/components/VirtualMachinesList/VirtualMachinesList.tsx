import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  NodeModel,
  VirtualMachineModelGroupVersionKind,
  VirtualMachineModelRef,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import useContainerWidth from '@kubevirt-utils/hooks/useContainerWidth';
import { KUBEVIRT_APISERVER_PROXY } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import {
  paginationDefaultValues,
  paginationInitialState,
} from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { usePVCMapper } from '@kubevirt-utils/hooks/usePVCMapper';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { getDescription, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import useVirtualMachineInstanceMigrationMapper from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrationMapper';
import useVirtualMachineInstanceMigrations from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrations';
import { clearCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { PROJECT_LIST_FILTER_PARAM } from '@kubevirt-utils/utils/constants';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { isEmpty, truncateToK8sName } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import { K8sVerb, ListPageBody, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Pagination, Split, SplitItem } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { useVirtualMachineInstanceMapper } from '@virtualmachines/list/hooks/useVirtualMachineInstanceMapper';
import useVMMetrics from '@virtualmachines/list/hooks/useVMMetrics';
import { getListPageBodySize, ListPageBodySize } from '@virtualmachines/list/listPageBodySize';
import { VM_FILTER_OPTIONS } from '@virtualmachines/list/utils/constants';
import { filterVMsByClusterAndNamespace } from '@virtualmachines/list/utils/utils';
import {
  getVMColumns,
  VM_COLUMN_KEYS,
  VMCallbacks,
} from '@virtualmachines/list/virtualMachinesDefinition';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import useVMSearchQueries from '@virtualmachines/search/hooks/useVMSearchQueries';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';
import { getVMIFromMapper, getVMIMFromMapper } from '@virtualmachines/utils/mappers';

import VirtualMachineTable from './components/VirtualMachineTable';
import { useCloneSourceVMFilters } from './hooks/useCloneSourceVMFilters';

const VirtualMachinesList = forwardRef(({}, ref) => {
  const { t } = useKubevirtTranslation();
  useSignals();
  useVMMetrics();
  const {
    cluster,
    project: targetNamespace,
    setCloneVMDescription,
    setCloneVMName,
  } = useVMWizardStore();

  // Initialize project dropdown filter to targetNamespace
  const queryParams = useQuery();
  const { setAllQueryArguments } = useQueryParamsMethods();
  const hasInitializedFilter = useRef(false);

  useEffect(() => {
    if (hasInitializedFilter.current || !targetNamespace) return;

    setAllQueryArguments({
      [PROJECT_LIST_FILTER_PARAM]: targetNamespace,
    });

    hasInitializedFilter.current = true;
  }, [targetNamespace, queryParams, setAllQueryArguments]);

  const isAllClustersPage = useIsAllClustersPage();
  const { loading: loadingFeatureProxy } = useFeatures(KUBEVIRT_APISERVER_PROXY);

  const searchQueries = useVMSearchQueries();

  const [namespacedVMs, namespacedVMsLoaded, loadError] = useKubevirtWatchResource<
    V1VirtualMachine[]
  >(
    targetNamespace
      ? {
          cluster,
          groupVersionKind: VirtualMachineModelGroupVersionKind,
          isList: true,
          limit: OBJECTS_FETCHING_LIMIT,
          namespace: targetNamespace,
          namespaced: true,
        }
      : null,
    VM_FILTER_OPTIONS,
    searchQueries?.vmQueries,
  );

  const {
    loaded: accessibleVMsLoaded,
    loadError: accessibleVMsError,
    resources: accessibleVMs,
  } = useAccessibleResources<V1VirtualMachine>({
    filterOptions: VM_FILTER_OPTIONS,
    groupVersionKind: VirtualMachineModelGroupVersionKind,
  });

  const vms = targetNamespace ? namespacedVMs : accessibleVMs;
  const vmsLoaded = targetNamespace ? namespacedVMsLoaded : accessibleVMsLoaded;
  const vmsLoadError = targetNamespace ? loadError : accessibleVMsError;

  const [vmims, vmimsLoaded] = useVirtualMachineInstanceMigrations(cluster, targetNamespace);
  const { vmiMapper, vmisLoaded } = useVirtualMachineInstanceMapper();
  const vmimMapper = useVirtualMachineInstanceMigrationMapper(vmims);
  const pvcMapper = usePVCMapper(targetNamespace, cluster);

  const { filtersWithSelect, rowFilters } = useCloneSourceVMFilters(vms, vmiMapper, pvcMapper);

  const [pagination, setPagination] = useState(paginationInitialState);

  const [unfilteredData, filteredVMs, onFilterChange] = useListPageFilter<
    V1VirtualMachine,
    V1VirtualMachine
  >(vms, [...filtersWithSelect, ...rowFilters], {});

  // Clear selection when namespace/cluster changes
  useEffect(() => {
    clearCustomizeInstanceType();
  }, [cluster, targetNamespace]);

  useImperativeHandle(
    ref,
    () => ({
      onFilterChange,
    }),
    [onFilterChange],
  );

  const listPageBodyRef = useRef<HTMLDivElement>(null);
  const listPageBodySize = getListPageBodySize(useContainerWidth(listPageBodyRef));

  const onPageChange = ({ endIndex, page, perPage, startIndex }) => {
    setPagination(() => ({
      endIndex,
      page,
      perPage,
      startIndex,
    }));
  };

  const [canGetNode] = useFleetAccessReview({
    cluster,
    namespace: undefined,
    resource: NodeModel.plural,
    verb: 'get' as K8sVerb,
  });

  const columns = useMemo(
    () => getVMColumns(t, undefined, isAllClustersPage, canGetNode),
    [t, isAllClustersPage, canGetNode],
  );

  // Filter out selection column
  const columnsWithoutSelection = useMemo(
    () => columns.filter((col) => col.key !== VM_COLUMN_KEYS.selection),
    [columns],
  );

  const manageableColumns = useMemo(
    () => columnsWithoutSelection.filter((col) => col.label),
    [columnsWithoutSelection],
  );

  const [activeColumns, , loadedColumns] = useKubevirtUserSettingsTableColumns<V1VirtualMachine>({
    columnManagementID: VirtualMachineModelRef,
    columns: manageableColumns.map((col) => ({
      additional: col.additional,
      id: col.key,
      props: col.props,
      title: col.label,
    })),
  });

  const activeColumnKeys = useMemo(() => {
    const managedKeys =
      activeColumns?.map((col) => col?.id) ??
      manageableColumns.filter((col) => !col.additional).map((col) => col.key);

    const nonManageableKeys = columnsWithoutSelection
      .filter((col) => !col.label)
      .map((col) => col.key);

    return Array.from(new Set([...nonManageableKeys, ...managedKeys]));
  }, [activeColumns, columnsWithoutSelection, manageableColumns]);

  const columnLayout = useMemo(
    () => buildColumnLayout(manageableColumns, activeColumnKeys, VirtualMachineModelRef),
    [manageableColumns, activeColumnKeys],
  );

  const loaded = vmsLoaded && vmisLoaded && vmimsLoaded && !loadingFeatureProxy && loadedColumns;

  const allVMsInNamespace = useMemo(
    () => filterVMsByClusterAndNamespace(vmsSignal.value, undefined, cluster),
    [cluster],
  );

  const hasNoVMs = useMemo(() => isEmpty(allVMsInNamespace), [allVMsInNamespace]);

  const callbacks: VMCallbacks = useMemo(
    () => ({
      getVmi: (vm: V1VirtualMachine) => getVMIFromMapper(vmiMapper, vm),
      getVmim: (vm: V1VirtualMachine) =>
        getVMIMFromMapper(vmimMapper, getName(vm), getNamespace(vm), getCluster(vm)),
      pvcMapper,
      vmiMapper,
      vmimMapper,
    }),
    [vmiMapper, vmimMapper, pvcMapper],
  );

  // Get active columns for table
  const activeTableColumns = useMemo(() => {
    return columnsWithoutSelection.filter((col) => activeColumnKeys.includes(col.key));
  }, [columnsWithoutSelection, activeColumnKeys]);

  // Pagination
  const paginatedData = useMemo(() => {
    const { endIndex, startIndex } = pagination;
    return filteredVMs?.slice(startIndex, endIndex) || [];
  }, [filteredVMs, pagination]);

  const setVM = (vm: V1VirtualMachine) => {
    const sourceVMName = getName(vm);
    const cloneVMName = truncateToK8sName(isVM(vm) ? `${sourceVMName}-clone` : sourceVMName);
    setCloneVMName(cloneVMName);
    setCloneVMDescription(getDescription(vm));
    vmSignal.value = vm;
  };

  return (
    <>
      <ListPageBody>
        <div className="vm-listpagebody" ref={listPageBodyRef}>
          <>
            <Split hasGutter>
              <SplitItem>
                <ListPageFilter
                  onFilterChange={(...args) => {
                    onFilterChange(...args);
                    setPagination((prevPagination) => ({
                      ...prevPagination,
                      endIndex: prevPagination?.perPage,
                      page: 1,
                      startIndex: 0,
                    }));
                  }}
                  columnLayout={columnLayout}
                  data={unfilteredData}
                  filtersWithSelect={filtersWithSelect}
                  loaded={loaded}
                  rowFilters={rowFilters}
                />
              </SplitItem>
              <SplitItem isFilled />
              <SplitItem>
                <Pagination
                  onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                    onPageChange({ endIndex, page, perPage, startIndex })
                  }
                  onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                    onPageChange({ endIndex, page, perPage, startIndex })
                  }
                  className="list-managment-group__pagination"
                  isCompact={listPageBodySize !== ListPageBodySize.lg}
                  isLastFullPageShown
                  itemCount={filteredVMs?.length}
                  page={pagination?.page}
                  perPage={pagination?.perPage}
                  perPageOptions={paginationDefaultValues}
                />
              </SplitItem>
            </Split>
            {vmsLoaded && hasNoVMs ? (
              <Bullseye>{t('No VirtualMachines found')}</Bullseye>
            ) : (
              <VirtualMachineTable
                callbacks={callbacks}
                columns={activeTableColumns}
                data={paginatedData}
                loaded={loaded}
                loadError={vmsLoadError}
                selectedVMState={[vmSignal.value, setVM]}
              />
            )}
          </>
        </div>
      </ListPageBody>
    </>
  );
});

export default VirtualMachinesList;
