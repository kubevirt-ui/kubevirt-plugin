import { useCallback, useEffect } from 'react';

import usePagination from './usePagination';
import { PaginationState } from './utils/types';

type OnFilterChange = (...args: unknown[]) => void;

type UsePaginationWithFiltersResult = {
  handleFilterChange?: (...args: Parameters<OnFilterChange>) => void;
  handlePerPageSelect: (
    _e: unknown,
    perPage: number,
    page: number,
    startIndex: number,
    endIndex: number,
  ) => void;
  handleSetPage: (
    _e: unknown,
    page: number,
    perPage: number,
    startIndex: number,
    endIndex: number,
  ) => void;
  onPaginationChange: (newPagination: PaginationState) => void;
  pagination: PaginationState;
};

const usePaginationWithFilters = (
  filteredDataLength: number,
  onFilterChange?: OnFilterChange,
): UsePaginationWithFiltersResult => {
  const { onPaginationChange, pagination } = usePagination();

  const resetPagination = useCallback(() => {
    onPaginationChange({
      endIndex: pagination?.perPage,
      page: 1,
      perPage: pagination?.perPage,
      startIndex: 0,
    });
  }, [onPaginationChange, pagination?.perPage]);

  const handleFilterChange = useCallback(
    (...args: Parameters<OnFilterChange>) => {
      onFilterChange?.(...args);
      resetPagination();
    },
    [onFilterChange, resetPagination],
  );

  const handlePerPageSelect = useCallback(
    (_e: unknown, perPage: number, page: number, startIndex: number, endIndex: number) =>
      onPaginationChange({ endIndex, page, perPage, startIndex }),
    [onPaginationChange],
  );

  const handleSetPage = useCallback(
    (_e: unknown, page: number, perPage: number, startIndex: number, endIndex: number) =>
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
  };
};

export default usePaginationWithFilters;
