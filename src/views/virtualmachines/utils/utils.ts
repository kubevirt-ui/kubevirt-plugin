export const OBJECTS_FETCHING_LIMIT = 10000;

export const paginationDefaultValues = [
  { title: '15', value: 15 },
  { title: '50', value: 50 },
  { title: '100', value: 100 },
  { title: '200', value: 200 },
];

export const paginationInitialState = {
  page: 1,
  perPage: 15,
  startIndex: 0,
  endIndex: 50,
};
