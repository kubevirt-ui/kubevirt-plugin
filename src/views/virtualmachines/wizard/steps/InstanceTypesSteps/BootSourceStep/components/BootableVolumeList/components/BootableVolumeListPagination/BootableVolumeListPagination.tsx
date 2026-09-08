import React, { type Dispatch, type FC, type SetStateAction } from 'react';

import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
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
  const onPageChange = ({ endIndex, page, perPage, startIndex }: PaginationState): void => {
    setPagination(() => ({
      endIndex,
      page,
      perPage,
      startIndex,
    }));
  };
  return (
    <Pagination
      isLastFullPageShown
      itemCount={data?.length}
      onPerPageSelect={(_event, perPage, page, startIndex, endIndex) =>
        onPageChange({ endIndex, page, perPage, startIndex })
      }
      onSetPage={(_event, page, perPage, startIndex, endIndex) =>
        onPageChange({ endIndex, page, perPage, startIndex })
      }
      page={pagination?.page}
      perPage={pagination?.perPage}
      perPageOptions={paginationDefaultValuesForm}
    />
  );
};

export default BootableVolumeListPagination;
