export type PaginationState = {
  page: number;
  perPage: number;
  startIndex: number;
  endIndex: number;
};

export type UsePaginationValues = {
  pagination: PaginationState;
  onPaginationChange: (newPagination: PaginationState) => void;
};

export type UsePagination = () => UsePaginationValues;
