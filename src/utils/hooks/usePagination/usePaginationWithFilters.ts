import { useCallback, useEffect } from 'react';

import { PaginationState } from './utils/types';
import usePagination from './usePagination';

type OnFilterChange = (...args: unknown[]) => void;

type UsePaginationWithFiltersResult = {
  handleFilterChange: (...args: Parameters<OnFilterChange>) => void;
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
  onFilterChange: OnFilterChange,
): UsePaginationWithFiltersResult => {
  const { onPaginationChange, pagination } = usePagination();

  const handleFilterChange = useCallback(
    (...args: Parameters<OnFilterChange>) => {
      onFilterChange(...args);
      onPaginationChange({
        endIndex: pagination?.perPage,
        page: 1,
        perPage: pagination?.perPage,
        startIndex: 0,
      });
    },
    [onFilterChange, onPaginationChange, pagination?.perPage],
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
      onPaginationChange({
        endIndex: pagination?.perPage,
        page: 1,
        perPage: pagination?.perPage,
        startIndex: 0,
      });
    }
  }, [filteredDataLength, pagination?.startIndex, pagination?.perPage, onPaginationChange]);

  return {
    handleFilterChange,
    handlePerPageSelect,
    handleSetPage,
    onPaginationChange,
    pagination,
  };
};

export default usePaginationWithFilters;
