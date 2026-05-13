import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';

export const paginationDefaultValuesForm = [
  { title: '8', value: 8 },
  { title: '16', value: 16 },
];

export const paginationInitialStateForm: PaginationState = {
  endIndex: 8,
  page: 1,
  perPage: 8,
  startIndex: 0,
};

export const WINDOWS_BOOTSOURCE_PIPELINE = 'windows-bootsource-pipeline';

export const NAME_COLUMN_ID = 'name';
export const NAMESPACE_COLUMN_ID = 'namespace';
export const FAVORITES_COLUMN_ID = 'favorites';
export const OPERATING_SYSTEM_COLUMN_ID = 'operating-system';
export const STORAGE_CLASS_COLUMN_ID = 'storage-class';
export const SIZE_COLUMN_ID = 'size';
export const DESCRIPTION_COLUMN_ID = 'description';
