export const OBJECTS_FETCHING_LIMIT = 10000;

export const paginationDefaultValues = [
  { title: '15', value: 15 },
  { title: '50', value: 50 },
  { title: '100', value: 100 },
  { title: '200', value: 200 },
];

export type PaginationState = {
  page: number;
  perPage: number;
  startIndex: number;
  endIndex: number;
};

export const paginationInitialState: PaginationState = {
  page: 1,
  perPage: 15,
  startIndex: 0,
  endIndex: 50,
};

export const booleanTextIds = {
  yes: 'yes',
  no: 'no',
};

export const NETWORK = 'netwrok';
