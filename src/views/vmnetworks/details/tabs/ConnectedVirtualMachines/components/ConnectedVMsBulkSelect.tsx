import React, { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getK8sSelectionId } from '@kubevirt-utils/components/KubevirtTable/utils';
import { getBulkSelectedItems } from '@kubevirt-utils/components/KubevirtTable/utils/getBulkSelectedItems';
import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { BulkSelect } from '@patternfly/react-component-groups';

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
  const selectedIds = new Set(selectedVMs.map((vm) => getK8sSelectionId(vm)));

  const isPageSelected =
    !isEmpty(currentPageVMs) &&
    currentPageVMs.every((vm) => selectedIds.has(getK8sSelectionId(vm)));
  const isPagePartiallySelected =
    !isPageSelected && currentPageVMs.some((vm) => selectedIds.has(getK8sSelectionId(vm)));

  return (
    <BulkSelect
      canSelectAll
      onSelect={(value) =>
        setSelectedVMs(
          getBulkSelectedItems({
            allItems: filteredVMs,
            currentPageItems: currentPageVMs,
            getItemId: getK8sSelectionId,
            selectedItems: selectedVMs,
            value,
          }),
        )
      }
      pageCount={currentPageVMs.length}
      pagePartiallySelected={isPagePartiallySelected}
      pageSelected={isPageSelected}
      selectedCount={selectedVMs.length}
      totalCount={filteredVMs.length}
    />
  );
};

export default ConnectedVMsBulkSelect;
