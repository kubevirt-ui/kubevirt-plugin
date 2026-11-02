/**
 * Gallery alias for clone-source VM list column hook.
 * Reuses production column definitions without user-settings or fleet access review.
 */
import { useMemo } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import type { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import type { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';
import type { VMCallbacks } from '@virtualmachines/list/virtualMachinesDefinition';
import { getVMColumns, VM_COLUMN_KEYS } from '@virtualmachines/list/virtualMachinesDefinition';

import { getActiveColumnKeys } from 'src/views/virtualmachines/wizard/steps/CloneSourceStep/components/VirtualMachinesList/utils/utils';

type UseCloneSourceVMColumnsReturn = {
  activeTableColumns: ColumnConfig<V1VirtualMachine, VMCallbacks>[];
  columnLayout: ColumnLayout;
  loadedColumns: boolean;
};

/** Builds default VM list columns for the wizard clone step table. */
const useCloneSourceVMColumns = (_cluster: string): UseCloneSourceVMColumnsReturn => {
  const { t } = useKubevirtTranslation();
  const columns = useMemo(() => getVMColumns(t, undefined, false, false), [t]);
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

  const columnKeys = useMemo(
    () => getActiveColumnKeys(undefined, columnsWithoutSelection, manageableColumns),
    [columnsWithoutSelection, manageableColumns],
  );

  return useMemo(
    () => ({
      activeTableColumns: columnsWithoutSelection.filter((col) => columnKeys.includes(col.key)),
      columnLayout: buildColumnLayout(manageableColumns, columnKeys, 'VirtualMachine'),
      loadedColumns: true,
    }),
    [columnKeys, columnsWithoutSelection, manageableColumns],
  );
};

export default useCloneSourceVMColumns;
