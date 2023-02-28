import { PerPageOptions } from '@patternfly/react-core';

export const paginationDefaultValuesForm = [
  { title: '5', value: 5 },
  { title: '10', value: 10 },
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
  perPage: 5,
  startIndex: 0,
  endIndex: 5,
};

export const paginationInitialStateModal: PaginationState = {
  page: 1,
  perPage: 15,
  startIndex: 0,
  endIndex: 15,
};
