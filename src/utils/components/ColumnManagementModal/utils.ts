import { DATA_LIST_PREFIX } from './constants';

export const createInputId = (columnId: string) => `${DATA_LIST_PREFIX}${columnId}`;

export const getColumnId = (inputId: string) => inputId.replace(DATA_LIST_PREFIX, '');
