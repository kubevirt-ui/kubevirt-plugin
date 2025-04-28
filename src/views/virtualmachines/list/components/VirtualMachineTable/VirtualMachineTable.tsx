import React, { FC, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import { K8sResourceCommon, TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { DataView, DataViewTable, DataViewTr } from '@patternfly/react-data-view';
import useDataViewColumnTH from '@virtualmachines/list/hooks/useDataViewTH';
import useTableStates from '@virtualmachines/list/hooks/useTableStates';
import { PVCMapper, VMIMapper, VMIMMapper } from '@virtualmachines/utils/mappers';

import { getVirtualMachineRowTDs } from './getVirtualMachineRowTDs';

type VirtualMachineTableProps = {
  activeColumns: TableColumn<K8sResourceCommon>[];
  data: V1VirtualMachine[];
  empty: boolean;
  loaded: boolean;
  loadError: any;
  namespace: string;
  pvcMapper: PVCMapper;
  vmiMapper: VMIMapper;
  vmimMapper: VMIMMapper;
};

const VirtualMachineTable: FC<VirtualMachineTableProps> = ({
  activeColumns,
  data,
  empty,
  loaded,
  loadError,
  namespace,
  pvcMapper,
  vmiMapper,
  vmimMapper,
}) => {
  const [isSingleNodeCluster, isSingleNodeClusterLoaded] = useSingleNodeCluster();

  const [bodyStates, headStates, currentListState] = useTableStates(
    namespace,
    loadError,
    loaded && isSingleNodeClusterLoaded,
    empty,
  );

  const columnsTh = useDataViewColumnTH(activeColumns);

  const rows: DataViewTr[] = useMemo(
    () =>
      (data || []).map((vm) =>
        getVirtualMachineRowTDs({
          activeColumnsIDs: activeColumns?.map((column) => column.id),
          getVMI: (ns: string, name: string) => vmiMapper?.mapper?.[ns]?.[name],
          getVMIM: (ns: string, name: string) => vmimMapper?.[ns]?.[name],
          isSingleNodeCluster,
          pvcMapper,
          vm,
        }),
      ),
    [activeColumns, data, pvcMapper, isSingleNodeCluster, vmiMapper?.mapper, vmimMapper],
  );

  return (
    <DataView activeState={currentListState}>
      <DataViewTable
        aria-label="VirtualMachine list"
        bodyStates={bodyStates}
        columns={columnsTh}
        headStates={headStates}
        ouiaId={'VirtualMachineList'}
        rows={rows}
      />
    </DataView>
  );
};

export default VirtualMachineTable;
