import { useState } from 'react';

import { paginationInitialState } from './utils/constants';
import { PaginationState, UsePagination } from './utils/types';

const usePagination: UsePagination = () => {
  const [pagination, setPagination] = useState<PaginationState>(paginationInitialState);

  const onPaginationChange = (newPagination: PaginationState) => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      ...newPagination,
    }));
  };

  return { pagination, onPaginationChange };
};

export default usePagination;
