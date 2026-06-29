import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useWatch } from 'react-hook-form';

import {
  NodeModel,
  VirtualMachineModelGroupVersionKind,
  VirtualMachineModelRef,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import { getActiveColumns } from '@kubevirt-utils/components/KubevirtTable/utils/getActiveColumns';
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
import { getDescription } from '@kubevirt-utils/resources/shared';
import useVirtualMachineInstanceMigrationMapper from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrationMapper';
import useVirtualMachineInstanceMigrations from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrations';
import { clearCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import { K8sVerb, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Pagination, Split, SplitItem } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
import { useVirtualMachineInstanceMapper } from '@virtualmachines/list/hooks/useVirtualMachineInstanceMapper';
import useVMMetrics from '@virtualmachines/list/hooks/useVMMetrics';
import { getListPageBodySize, ListPageBodySize } from '@virtualmachines/list/listPageBodySize';
import { VM_FILTER_OPTIONS } from '@virtualmachines/list/utils/constants';
import { getVMColumns, VM_COLUMN_KEYS } from '@virtualmachines/list/virtualMachinesDefinition';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import useVMSearchQueries from '@virtualmachines/search/hooks/useVMSearchQueries';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

import VirtualMachineTable from './components/VirtualMachineTable';
import { useCloneSourceVMFilters } from './hooks/useCloneSourceVMFilters';
import {
  getActiveColumnKeys,
  getCloneSourceVMName,
  getPaginatedVMs,
  getPaginationFirstPageState,
  getVMTableCallbacks,
  resolveVMListSource,
} from './utils';

// TODO: refactor this component
const VirtualMachinesList = forwardRef(({}, ref) => {
  const { t } = useKubevirtTranslation();
  useSignals();
  useVMMetrics();
  const { control, setValue } = useVMWizard();
  const [cluster, targetNamespace] = useWatch({
    control,
    name: [CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER, CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT],
  });

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

  const {
    loaded: vmsLoaded,
    loadError: vmsLoadError,
    vms,
  } = resolveVMListSource(
    targetNamespace,
    { loaded: namespacedVMsLoaded, loadError, vms: namespacedVMs },
    { loaded: accessibleVMsLoaded, loadError: accessibleVMsError, vms: accessibleVMs },
  );

  const [vmims, vmimsLoaded] = useVirtualMachineInstanceMigrations(cluster, targetNamespace);
  const { vmiMapper, vmisLoaded } = useVirtualMachineInstanceMapper();
  const vmimMapper = useVirtualMachineInstanceMigrationMapper(vmims);
  const pvcMapper = usePVCMapper(targetNamespace, cluster);

  const { rowFilters } = useCloneSourceVMFilters(vms, vmiMapper, pvcMapper);

  const [pagination, setPagination] = useState(paginationInitialState);

  const [unfilteredData, filteredVMs, onFilterChange] = useListPageFilter<
    V1VirtualMachine,
    V1VirtualMachine
  >(vms, rowFilters, {});

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

  const { columnsWithoutSelection, manageableColumns } = useMemo(() => {
    const filteredColumnsWithoutSelection = columns.filter(
      (col) => col.key !== VM_COLUMN_KEYS.selection,
    );
    const filteredManageableColumns = filteredColumnsWithoutSelection.filter((col) => col.label);
    return {
      columnsWithoutSelection: filteredColumnsWithoutSelection,
      manageableColumns: filteredManageableColumns,
    };
  }, [columns]);

  const [activeColumns, , loadedColumns] = useKubevirtUserSettingsTableColumns<V1VirtualMachine>({
    columnManagementID: VirtualMachineModelRef,
    columns: manageableColumns.map((col) => ({
      additional: col.additional,
      id: col.key,
      props: col.props,
      title: col.label,
    })),
  });

  const { activeTableColumns, columnLayout } = useMemo(() => {
    const columnKeys = getActiveColumnKeys(
      activeColumns,
      columnsWithoutSelection,
      manageableColumns,
    );

    return {
      activeTableColumns: getActiveColumns(columnsWithoutSelection, columnKeys),
      columnLayout: buildColumnLayout(manageableColumns, columnKeys, VirtualMachineModelRef),
    };
  }, [activeColumns, columnsWithoutSelection, manageableColumns]);

  const loaded = vmsLoaded && vmisLoaded && vmimsLoaded && !loadingFeatureProxy && loadedColumns;

  const callbacks = useMemo(
    () => getVMTableCallbacks(vmiMapper, vmimMapper, pvcMapper),
    [vmiMapper, vmimMapper, pvcMapper],
  );

  const paginatedData = useMemo(
    () => getPaginatedVMs(filteredVMs, pagination),
    [filteredVMs, pagination],
  );

  const setVM = (vm: V1VirtualMachine) => {
    setValue(CREATE_VM_FORM_FIELDS_VM_DATA.NAME, getCloneSourceVMName(vm));
    setValue(CREATE_VM_FORM_FIELDS_VM_DATA.DESCRIPTION, getDescription(vm) ?? '');
    vmSignal.value = vm;
  };

  return (
    <div className="pf-v6-u-mt-sm" ref={listPageBodyRef}>
      {targetNamespace && (
        <Label className="pf-v6-u-mb-sm" data-test="clone-source-project-label">
          {t('Project: {{project}}', { project: targetNamespace })}
        </Label>
      )}
      <Split className="pf-v6-u-mb-sm" hasGutter>
        <SplitItem>
          <ListPageFilter
            onFilterChange={(...args) => {
              onFilterChange(...args);
              setPagination((prevPagination) => getPaginationFirstPageState(prevPagination));
            }}
            columnLayout={columnLayout}
            data={unfilteredData}
            loaded
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
      <VirtualMachineTable
        callbacks={callbacks}
        cluster={cluster}
        columns={activeTableColumns}
        data={paginatedData}
        loaded={loaded}
        loadError={vmsLoadError}
        selectedVMState={[vmSignal.value, setVM]}
      />
    </div>
  );
});

export default VirtualMachinesList;
