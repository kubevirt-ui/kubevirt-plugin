import type { FC } from 'react';

import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { Pagination, type PaginationProps } from '@patternfly/react-core';

import '@kubevirt-utils/styles/list-managment-group.scss';

type KubevirtTablePaginationProps = {
  itemCount: PaginationProps['itemCount'];
  onPerPageSelect: PaginationProps['onPerPageSelect'];
  onSetPage: PaginationProps['onSetPage'];
  pagination: PaginationState;
};

const KubevirtTablePagination: FC<KubevirtTablePaginationProps> = ({
  itemCount,
  onPerPageSelect,
  onSetPage,
  pagination,
}) => (
  <Pagination
    className="list-managment-group__pagination"
    isLastFullPageShown
    itemCount={itemCount}
    onPerPageSelect={onPerPageSelect}
    onSetPage={onSetPage}
    page={pagination?.page}
    perPage={pagination?.perPage}
    perPageOptions={paginationDefaultValues}
  />
);

export default KubevirtTablePagination;
