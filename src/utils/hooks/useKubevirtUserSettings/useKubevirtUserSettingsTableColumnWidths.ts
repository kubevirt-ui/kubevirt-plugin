import { useCallback, useMemo } from 'react';

import { useDebounceCallback } from '@kubevirt-utils/hooks/useDebounceCallback';

import useKubevirtUserSettings from './useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from './utils/const';

const COLUMN_WIDTH_PERSIST_DEBOUNCE_MS = 500;

type UseKubevirtUserSettingsTableColumnWidthsResult = {
  columnWidths: Record<string, number>;
  loaded: boolean;
  persistColumnWidth: (columnId: string, width: number) => void;
  resetColumnWidths: () => void;
};

const useKubevirtUserSettingsTableColumnWidths = (
  tableId: string,
): UseKubevirtUserSettingsTableColumnWidthsResult => {
  const [columnWidthsByTable, setColumnWidthsByTable, loaded] = useKubevirtUserSettings(
    USER_SETTINGS_KEYS.columnWidths,
  );

  const columnWidths = useMemo(
    () => columnWidthsByTable?.[tableId] ?? {},
    [columnWidthsByTable, tableId],
  );

  const persistColumnWidthImmediate = useCallback(
    (columnId: string, width: number) => {
      if (!setColumnWidthsByTable) return;
      const tableWidths = columnWidthsByTable?.[tableId] ?? {};
      void setColumnWidthsByTable({
        ...columnWidthsByTable,
        [tableId]: { ...tableWidths, [columnId]: width },
      });
    },
    [columnWidthsByTable, setColumnWidthsByTable, tableId],
  );

  const persistColumnWidth = useDebounceCallback(
    persistColumnWidthImmediate,
    COLUMN_WIDTH_PERSIST_DEBOUNCE_MS,
  );

  const resetColumnWidths = useCallback(() => {
    if (!setColumnWidthsByTable || !columnWidthsByTable?.[tableId]) return;
    const { [tableId]: _removed, ...remainingTables } = columnWidthsByTable;
    void setColumnWidthsByTable(remainingTables);
  }, [columnWidthsByTable, setColumnWidthsByTable, tableId]);

  return { columnWidths, loaded, persistColumnWidth, resetColumnWidths };
};

export default useKubevirtUserSettingsTableColumnWidths;
