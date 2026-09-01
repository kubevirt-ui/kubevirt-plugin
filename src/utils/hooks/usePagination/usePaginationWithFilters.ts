import { useCallback, useEffect } from 'react';

import usePagination from './usePagination';
import { type PaginationState } from './utils/types';

type OnFilterChange = (...args: unknown[]) => void;

type UsePaginationWithFiltersResult = {
  handleFilterChange?: (...args: Parameters<OnFilterChange>) => void;
  handlePerPageSelect: (
    _event: unknown,
    perPage: number,
    page: number,
    startIndex: number,
    endIndex: number,
  ) => void;
  handleSetPage: (
    _event: unknown,
    page: number,
    perPage: number,
    startIndex: number,
    endIndex: number,
  ) => void;
  onPaginationChange: (newPagination: PaginationState) => void;
  pagination: PaginationState;
  resetPagination: () => void;
};

const usePaginationWithFilters = (
  filteredDataLength: number,
  onFilterChange?: OnFilterChange,
): UsePaginationWithFiltersResult => {
  const { onPaginationChange, pagination, resetPagination } = usePagination();

  const handleFilterChange = useCallback(
    (...args: Parameters<OnFilterChange>) => {
      onFilterChange?.(...args);
      resetPagination();
    },
    [onFilterChange, resetPagination],
  );

  const handlePerPageSelect = useCallback(
    (_event: unknown, perPage: number, page: number, startIndex: number, endIndex: number) =>
      onPaginationChange({ endIndex, page, perPage, startIndex }),
    [onPaginationChange],
  );

  const handleSetPage = useCallback(
    (_event: unknown, page: number, perPage: number, startIndex: number, endIndex: number) =>
      onPaginationChange({ endIndex, page, perPage, startIndex }),
    [onPaginationChange],
  );

  useEffect(() => {
    if (filteredDataLength > 0 && pagination?.startIndex >= filteredDataLength) {
      resetPagination();
    }
  }, [filteredDataLength, pagination?.startIndex, resetPagination]);

  return {
    ...(onFilterChange && { handleFilterChange }),
    handlePerPageSelect,
    handleSetPage,
    onPaginationChange,
    pagination,
    resetPagination,
  };
};

export default usePaginationWithFilters;
