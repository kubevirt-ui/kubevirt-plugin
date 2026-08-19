import React, { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { BulkSelect } from '@patternfly/react-component-groups';

import { getBulkSelectedVMs } from '../utils/bulkSelect';

type ConnectedVMsBulkSelectProps = {
  filteredVMs: V1VirtualMachine[];
  pagination: PaginationState;
  selectedVMs: V1VirtualMachine[];
  setSelectedVMs: (vms: V1VirtualMachine[]) => void;
};

const ConnectedVMsBulkSelect: FC<ConnectedVMsBulkSelectProps> = ({
  filteredVMs,
  pagination,
  selectedVMs,
  setSelectedVMs,
}) => {
  const currentPageVMs = filteredVMs.slice(pagination.startIndex, pagination.endIndex);

  const isPageSelected =
    !isEmpty(currentPageVMs) && currentPageVMs.every((vm) => selectedVMs.includes(vm));
  const isPagePartiallySelected =
    !isPageSelected && currentPageVMs.some((vm) => selectedVMs.includes(vm));

  return (
    <BulkSelect
      canSelectAll
      onSelect={(value) =>
        setSelectedVMs(getBulkSelectedVMs({ currentPageVMs, filteredVMs, selectedVMs, value }))
      }
      pagePartiallySelected={isPagePartiallySelected}
      pageSelected={isPageSelected}
      selectedCount={selectedVMs.length}
      totalCount={filteredVMs.length}
    />
  );
};

export default ConnectedVMsBulkSelect;
