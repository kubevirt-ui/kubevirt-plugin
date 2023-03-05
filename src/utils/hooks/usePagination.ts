import { useState } from 'react';

import { paginationInitialState, PaginationState } from '@virtualmachines/utils';

type UsePagination = () => [
  pagination: PaginationState,
  onPaginationChange: (newPagination: PaginationState) => void,
];

const usePagination: UsePagination = () => {
  const [pagination, setPagination] = useState<PaginationState>(paginationInitialState);

  const onPaginationChange = (newPagination: PaginationState) => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      ...newPagination,
    }));
  };

  return [pagination, onPaginationChange];
};

export default usePagination;
