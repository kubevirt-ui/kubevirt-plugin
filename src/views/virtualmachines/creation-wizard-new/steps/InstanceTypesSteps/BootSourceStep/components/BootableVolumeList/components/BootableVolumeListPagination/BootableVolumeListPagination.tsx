import React, { Dispatch, FC, SetStateAction } from 'react';

import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { Pagination } from '@patternfly/react-core';

import { paginationDefaultValuesForm } from '../../utils/constants';

type BootableVolumeListPaginationProps = {
  data: BootableVolume[];
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
};

const BootableVolumeListPagination: FC<BootableVolumeListPaginationProps> = ({
  data,
  pagination,
  setPagination,
}) => {
  const onPageChange = ({ endIndex, page, perPage, startIndex }) => {
    setPagination(() => ({
      endIndex,
      page,
      perPage,
      startIndex,
    }));
  };
  return (
    <Pagination
      onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
        onPageChange({ endIndex, page, perPage, startIndex })
      }
      onSetPage={(_e, page, perPage, startIndex, endIndex) =>
        onPageChange({ endIndex, page, perPage, startIndex })
      }
      isLastFullPageShown
      itemCount={data?.length}
      page={pagination?.page}
      perPage={pagination?.perPage}
      perPageOptions={paginationDefaultValuesForm}
    />
  );
};

export default BootableVolumeListPagination;
