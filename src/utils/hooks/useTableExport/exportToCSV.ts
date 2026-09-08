import { saveAs } from 'file-saver';

import {
  type ColumnConfig,
  type ExportableColumnConfig,
} from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { NON_EXPORTABLE_COLUMN_KEYS } from './constants';

const CSV_DELIMITER = ',';
const CSV_FORMULA_PREFIX = /^[\t=+\-@]/;

const escapeCSVField = (value: number | string): string => {
  let str = String(value ?? '');
  if (CSV_FORMULA_PREFIX.test(str)) {
    str = `'${str}`;
  }
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const formatCSVRow = (fields: (number | string)[]): string =>
  fields.map(escapeCSVField).join(CSV_DELIMITER);

const isExportableColumn = <TData, TCallbacks = undefined>(
  col: ColumnConfig<TData, TCallbacks>,
): col is ExportableColumnConfig<TData, TCallbacks> =>
  Boolean(col.label) &&
  typeof col.getValue === 'function' &&
  !NON_EXPORTABLE_COLUMN_KEYS.has(col.key);

export const getExportableColumns = <TData, TCallbacks = undefined>(
  columns: ColumnConfig<TData, TCallbacks>[],
  activeColumnKeys?: string[],
): ExportableColumnConfig<TData, TCallbacks>[] => {
  const visibleColumns = activeColumnKeys
    ? columns.filter((col) => activeColumnKeys.includes(col.key) || col.key === ACTIONS)
    : columns.filter((col) => !col.additional);

  return visibleColumns.filter(isExportableColumn);
};

export const buildCSVContent = <TData, TCallbacks = undefined>(
  data: TData[],
  columns: ColumnConfig<TData, TCallbacks>[],
  activeColumnKeys?: string[],
  callbacks?: TCallbacks,
): string => {
  const exportableColumns = getExportableColumns(columns, activeColumnKeys);

  if (isEmpty(exportableColumns)) {
    return '';
  }

  const headerRow = formatCSVRow(exportableColumns.map((col) => col.label));
  const dataRows = data.map((row) =>
    formatCSVRow(exportableColumns.map((col) => col.getValue(row, callbacks) ?? '')),
  );

  return [headerRow, ...dataRows].join('\n');
};

export const exportToCSV = <TData, TCallbacks = undefined>(
  data: TData[],
  columns: ColumnConfig<TData, TCallbacks>[],
  filename: string,
  activeColumnKeys?: string[],
  callbacks?: TCallbacks,
): void => {
  const csvContent = buildCSVContent(data, columns, activeColumnKeys, callbacks);

  if (!csvContent) {
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const sanitizedFilename = filename.replace(/\.csv$/i, '');
  saveAs(blob, `${sanitizedFilename}.csv`);
};
