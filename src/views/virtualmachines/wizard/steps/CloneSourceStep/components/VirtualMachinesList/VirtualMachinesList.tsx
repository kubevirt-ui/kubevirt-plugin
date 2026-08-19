import React, { FC, useMemo, useRef, useState } from 'react';

import useContainerWidth from '@kubevirt-utils/hooks/useContainerWidth';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { paginationInitialState } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { Label } from '@patternfly/react-core';
import { getListPageBodySize, ListPageBodySize } from '@virtualmachines/list/listPageBodySize';

import VirtualMachineFilter from './components/VirtualMachineFilter';
import VirtualMachineTable from './components/VirtualMachineTable';
import useCloneSourceVMColumns from './hooks/useCloneSourceVMColumns';
import { useCloneSourceVMs } from './hooks/useCloneSourceVMs';
import { getPaginatedVMs, getPaginationFirstPageState, getVMTableCallbacks } from './utils/utils';

const VirtualMachinesList: FC = () => {
  const { t } = useKubevirtTranslation();

  const {
    cluster,
    filterDefinitions,
    loadingFeatureProxy,
    pvcMapper,
    targetNamespace,
    vmiMapper,
    vmimMapper,
    vmimsLoaded,
    vmisLoaded,
    vms,
    vmsLoaded,
    vmsLoadError,
  } = useCloneSourceVMs();

  const { activeTableColumns, columnLayout, loadedColumns } = useCloneSourceVMColumns(cluster);

  const [pagination, setPagination] = useState(paginationInitialState);

  const {
    clearAllFilters,
    filteredData: filteredVMs,
    filters,
    onSetFilters,
  } = useKubevirtDataViewFilters({
    data: vms ?? [],
    filterDefinitions,
  });

  const listPageBodyRef = useRef<HTMLDivElement>(null);
  const listPageBodySize = getListPageBodySize(useContainerWidth(listPageBodyRef));

  const resetToFirstPage = (): void => {
    setPagination((prevPagination) => getPaginationFirstPageState(prevPagination));
  };

  const onPageChange = ({ endIndex, page, perPage, startIndex }) => {
    setPagination({ endIndex, page, perPage, startIndex });
  };

  const loaded = vmsLoaded && vmisLoaded && vmimsLoaded && !loadingFeatureProxy && loadedColumns;

  const callbacks = useMemo(
    () => getVMTableCallbacks(vmiMapper, vmimMapper, pvcMapper),
    [vmiMapper, vmimMapper, pvcMapper],
  );

  const paginatedVMsData = useMemo(
    () => getPaginatedVMs(filteredVMs, pagination),
    [filteredVMs, pagination],
  );

  return (
    <div className="pf-v6-u-mt-sm" ref={listPageBodyRef}>
      {targetNamespace && (
        <Label className="pf-v6-u-mb-sm">
          {t('Project: {{project}}', { project: targetNamespace })}
        </Label>
      )}
      <VirtualMachineFilter
        clearAllFilters={() => {
          clearAllFilters();
          resetToFirstPage();
        }}
        onSetFilters={(newFilters) => {
          onSetFilters(newFilters);
          resetToFirstPage();
        }}
        columnLayout={columnLayout}
        data={vms}
        filterDefinitions={filterDefinitions}
        filteredVMsCount={filteredVMs?.length}
        filters={filters}
        isCompact={listPageBodySize !== ListPageBodySize.lg}
        onPageChange={onPageChange}
        pagination={pagination}
      />
      <VirtualMachineTable
        callbacks={callbacks}
        cluster={cluster}
        columns={activeTableColumns}
        loaded={loaded}
        loadError={vmsLoadError}
        vmsData={paginatedVMsData}
      />
    </div>
  );
};

export default VirtualMachinesList;
