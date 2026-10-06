import { useMemo } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import type { ColumnConfig } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
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
