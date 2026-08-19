import { useCallback, useState } from 'react';

import { paginationInitialState } from './utils/constants';
import { PaginationState, UsePagination } from './utils/types';

const usePagination: UsePagination = () => {
  const [pagination, setPagination] = useState<PaginationState>(paginationInitialState);

  const onPaginationChange = useCallback((newPagination: PaginationState) => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      ...newPagination,
    }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination((prev) => {
      if (prev.page === 1 && prev.startIndex === 0) {
        return prev;
      }

      return {
        ...prev,
        endIndex: prev?.perPage,
        page: 1,
        startIndex: 0,
      };
    });
  }, []);

  return { onPaginationChange, pagination, resetPagination };
};

export default usePagination;
