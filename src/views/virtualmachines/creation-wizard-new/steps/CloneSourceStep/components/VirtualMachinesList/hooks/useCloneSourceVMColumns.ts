import { useMemo } from 'react';

import { NodeModel, VirtualMachineModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import { getActiveColumns } from '@kubevirt-utils/components/KubevirtTable/utils/getActiveColumns';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import { ColumnLayout, K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import {
  getVMColumns,
  VM_COLUMN_KEYS,
  VMCallbacks,
} from '@virtualmachines/list/virtualMachinesDefinition';

import { getActiveColumnKeys } from '../utils/utils';

type UseCloneSourceVMColumnsReturn = {
  activeTableColumns: ColumnConfig<V1VirtualMachine, VMCallbacks>[];
  columnLayout: ColumnLayout;
  loadedColumns: boolean;
};

const useCloneSourceVMColumns = (cluster: string): UseCloneSourceVMColumnsReturn => {
  const { t } = useKubevirtTranslation();
  const isAllClustersPage = useIsAllClustersPage();

  const [isAbleToGetNodeData] = useFleetAccessReview({
    cluster,
    namespace: undefined,
    resource: NodeModel.plural,
    verb: 'get' as K8sVerb,
  });

  const columns = useMemo(
    () => getVMColumns(t, undefined, isAllClustersPage, isAbleToGetNodeData),
    [t, isAllClustersPage, isAbleToGetNodeData],
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

  return { activeTableColumns, columnLayout, loadedColumns };
};

export default useCloneSourceVMColumns;
