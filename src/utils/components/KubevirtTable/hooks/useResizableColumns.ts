import { useCallback, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
): UseResizableColumnsResult => {
  const { t } = useKubevirtTranslation();
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  const onResize = useCallback<NonNullable<DataViewThResizableProps['onResize']>>(
    (_event, id, width) => {
      if (id === undefined) return;
      setColumnWidths((prev) => ({ ...prev, [String(id)]: width }));
    },
    [],
  );

  const resizedColumns = useMemo(() => {
    if (!isResizable) return columns;

    return columns.map((column) => {
      if (!isDataViewThObject(column)) return column;

      const columnId = column.props?.id;
      if (columnId === undefined || isEmptyCell(column.cell)) return column;

      const id = String(columnId);
      const storedWidth = columnWidths[id];

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
  }, [columnWidths, columns, isResizable, minColumnWidth, onResize, t]);

  const columnKey = useMemo(
    () => (isResizable ? getDataViewTableColumnKey(columns) : ''),
    [columns, isResizable],
  );

  return { columnKey, columns: resizedColumns as DataViewTh[] };
};
