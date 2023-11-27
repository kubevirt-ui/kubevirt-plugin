import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { PerPageOptions } from '@patternfly/react-core';

export const paginationDefaultValuesForm = [
  { title: '8', value: 8 },
  { title: '16', value: 16 },
];

export const paginationDefaultValuesModal: PerPageOptions[] = [
  { title: '15', value: 15 },
  { title: '30', value: 30 },
  { title: '50', value: 50 },
];

export const paginationInitialStateForm: PaginationState = {
  endIndex: 8,
  page: 1,
  perPage: 8,
  startIndex: 0,
};

export const paginationInitialStateModal: PaginationState = {
  endIndex: 16,
  page: 1,
  perPage: 16,
  startIndex: 0,
};
