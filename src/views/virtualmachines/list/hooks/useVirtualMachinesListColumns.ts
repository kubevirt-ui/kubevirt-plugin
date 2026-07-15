import { useMemo } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ColumnLayout } from '@kubevirt-utils/components/KubevirtTable/types';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import type { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { getVMColumns, type VMCallbacks } from '@virtualmachines/list/virtualMachinesDefinition';

const useVirtualMachineListColumns = (
  columnManagementID: string,
  namespace: string,
  isAllClustersPage: boolean,
  canGetNode: boolean,
  hideActions = false,
): {
  activeColumnKeys: string[];
  columnLayout: ColumnLayout;
  columns: ColumnConfig<V1VirtualMachine, VMCallbacks>[];
  loadedColumns: boolean;
} => {
  const { t } = useKubevirtTranslation();

  const columns = useMemo(
    () => getVMColumns(t, namespace, isAllClustersPage, canGetNode, hideActions),
    [t, namespace, isAllClustersPage, canGetNode, hideActions],
  );

  const manageableColumns: ColumnConfig<V1VirtualMachine, VMCallbacks>[] = useMemo(
    () => columns.filter((col) => col.label),
    [columns],
  );

  const [activeColumns, , loadedColumns] = useKubevirtUserSettingsTableColumns<V1VirtualMachine>({
    columnManagementID,
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

    // Always include non-manageable (unlabeled) columns such as the selection column
    const nonManageableKeys = columns.filter((col) => !col.label).map((col) => col.key);

    return Array.from(new Set([...nonManageableKeys, ...managedKeys]));
  }, [activeColumns, columns, manageableColumns]);

  const columnLayout = useMemo(
    () => buildColumnLayout(manageableColumns, activeColumnKeys, columnManagementID),
    [manageableColumns, activeColumnKeys, columnManagementID],
  );
  return { activeColumnKeys, columnLayout, columns, loadedColumns };
};

export default useVirtualMachineListColumns;
