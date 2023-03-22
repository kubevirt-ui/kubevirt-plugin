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

export type PaginationState = {
  page: number;
  perPage: number;
  startIndex: number;
  endIndex: number;
};

export const paginationInitialStateForm: PaginationState = {
  page: 1,
  perPage: 8,
  startIndex: 0,
  endIndex: 8,
};

export const paginationInitialStateModal: PaginationState = {
  page: 1,
  perPage: 16,
  startIndex: 0,
  endIndex: 16,
};
