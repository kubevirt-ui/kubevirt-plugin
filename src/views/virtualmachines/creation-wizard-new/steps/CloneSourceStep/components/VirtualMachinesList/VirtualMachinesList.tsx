import React, { FC, useMemo, useRef, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useContainerWidth from '@kubevirt-utils/hooks/useContainerWidth';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { paginationInitialState } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
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
    loadingFeatureProxy,
    pvcMapper,
    rowFilters,
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

  const [unfilteredData, filteredVMs, onFilterChange] = useListPageFilter<
    V1VirtualMachine,
    V1VirtualMachine
  >(vms, rowFilters, {});

  const listPageBodyRef = useRef<HTMLDivElement>(null);
  const listPageBodySize = getListPageBodySize(useContainerWidth(listPageBodyRef));

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
        <Label className="pf-v6-u-mb-sm" data-test="clone-source-project-label">
          {t('Project: {{project}}', { project: targetNamespace })}
        </Label>
      )}
      <VirtualMachineFilter
        onFilterChange={(...args) => {
          onFilterChange(...args);
          setPagination((prevPagination) => getPaginationFirstPageState(prevPagination));
        }}
        columnLayout={columnLayout}
        filteredVMsCount={filteredVMs?.length}
        isCompact={listPageBodySize !== ListPageBodySize.lg}
        onPageChange={onPageChange}
        pagination={pagination}
        rowFilters={rowFilters}
        unfilteredData={unfilteredData}
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
