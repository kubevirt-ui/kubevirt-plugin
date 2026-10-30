import { useCallback, useEffect, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumnWidths from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumnWidths';
import {
  type DataViewTh,
  isDataViewThObject,
} from '@patternfly/react-data-view/dist/esm/DataViewTable';
import type { DataViewThResizableProps } from '@patternfly/react-data-view/dist/esm/DataViewTh/DataViewTh';

import { isEmptyCell } from '../utils';

import { getDataViewTableColumnKey } from '../utils/getDataViewTableColumnKey';

export const DEFAULT_MIN_RESIZABLE_COLUMN_WIDTH = 48;

type UseResizableColumnsResult = {
  columnKey: string;
  columns: DataViewTh[];
};

export const useResizableColumns = (
  columns: DataViewTh[],
  isResizable?: boolean,
  minColumnWidth = DEFAULT_MIN_RESIZABLE_COLUMN_WIDTH,
  tableId?: string,
): UseResizableColumnsResult => {
  const { t } = useKubevirtTranslation();

  const { columnWidths: persistedWidths, persistColumnWidth } =
    useKubevirtUserSettingsTableColumnWidths(tableId ?? '');
  const isPersistenceEnabled = Boolean(tableId) && isResizable;

  const [localWidths, setLocalWidths] = useState<Record<string, number>>({});
  const [resetCounter, setResetCounter] = useState(0);
  const [hadPersistedWidths, setHadPersistedWidths] = useState(false);

  useEffect(() => {
    if (!isPersistenceEnabled) return;

    const hasPersistedWidths = Object.keys(persistedWidths).length > 0;

    if (hasPersistedWidths) {
      setHadPersistedWidths(true);
      setLocalWidths((prev) => ({ ...persistedWidths, ...prev }));
      return;
    }

    if (hadPersistedWidths) {
      setHadPersistedWidths(false);
      setLocalWidths({});
      setResetCounter((counter) => counter + 1);
    }
  }, [isPersistenceEnabled, persistedWidths, hadPersistedWidths]);

  const activeColumnWidths = useMemo(() => localWidths, [localWidths]);

  const onResize = useCallback<NonNullable<DataViewThResizableProps['onResize']>>(
    (_event, id, width) => {
      if (id === undefined) return;
      const columnId = String(id);
      setLocalWidths((prev) => ({ ...prev, [columnId]: width }));
      if (isPersistenceEnabled) {
        persistColumnWidth(columnId, width);
      }
    },
    [isPersistenceEnabled, persistColumnWidth],
  );

  const resizedColumns = useMemo(() => {
    if (!isResizable) return columns;

    return columns.map((column) => {
      if (!isDataViewThObject(column)) return column;

      const columnId = column.props?.id;
      if (columnId === undefined || isEmptyCell(column.cell)) return column;

      const id = String(columnId);
      const storedWidth = activeColumnWidths[id];

      return {
        ...column,
        resizableProps: {
          isResizable: true,
          minWidth: minColumnWidth,
          onResize,
          resizeButtonAriaLabel: t('Resize {{column}} column', { column: id }),
          ...(storedWidth !== undefined ? { width: storedWidth } : {}),
        },
      };
    });
  }, [activeColumnWidths, columns, isResizable, minColumnWidth, onResize, t]);

  const columnKey = useMemo(() => {
    if (!isResizable) {
      return '';
    }
    return `${getDataViewTableColumnKey(columns)}-w${resetCounter}`;
  }, [resetCounter, columns, isResizable]);

  return { columnKey, columns: resizedColumns as DataViewTh[] };
};
