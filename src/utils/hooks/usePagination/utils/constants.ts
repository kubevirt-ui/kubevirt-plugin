import { PerPageOptions } from '@patternfly/react-core';

import { PaginationState } from './types';

export const paginationDefaultValues: PerPageOptions[] = [
  { title: '15', value: 15 },
  { title: '50', value: 50 },
  { title: '100', value: 100 },
  { title: '200', value: 200 },
];

export const paginationInitialState: PaginationState = {
  endIndex: 15,
  page: 1,
  perPage: 15,
  startIndex: 0,
};
