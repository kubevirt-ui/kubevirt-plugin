import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';

export const paginationDefaultValues = [
  { title: '5', value: 5 },
  { title: '10', value: 10 },
];

export const paginationInitialState: PaginationState = {
  endIndex: 5,
  page: 1,
  perPage: 5,
  startIndex: 0,
};
