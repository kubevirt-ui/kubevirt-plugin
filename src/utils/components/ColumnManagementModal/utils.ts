import { ManagedColumn } from '@openshift-console/dynamic-plugin-sdk';

import { DATA_LIST_PREFIX, MAX_VIEW_COLS } from './constants';

export const createInputId = (columnId: string) => `${DATA_LIST_PREFIX}${columnId}`;

export const getColumnId = (inputId: string) => inputId.replace(DATA_LIST_PREFIX, '');

export const getMaxColumnsToSelect = (allColumns: ManagedColumn[]) =>
  MAX_VIEW_COLS - allColumns.filter((column) => column.title === '').length;
