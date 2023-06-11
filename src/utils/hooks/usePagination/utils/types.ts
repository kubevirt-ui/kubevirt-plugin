export type PaginationState = {
  endIndex: number;
  page: number;
  perPage: number;
  startIndex: number;
};

export type UsePaginationValues = {
  onPaginationChange: (newPagination: PaginationState) => void;
  pagination: PaginationState;
};

export type UsePagination = () => UsePaginationValues;
