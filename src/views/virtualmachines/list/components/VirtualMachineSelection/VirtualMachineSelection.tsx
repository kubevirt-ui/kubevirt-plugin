import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { BulkSelect } from '@patternfly/react-component-groups/dist/dynamic/BulkSelect';
import { FlexItem } from '@patternfly/react-core';
import useExistingSelectedVMs from '@virtualmachines/list/hooks/useExistingSelectedVMs';

import { handleBulkSelect } from './utils/bulkSelect';

import './virtual-machine-selection.scss';

type VirtualMachineSelectionProps = {
  pagination: PaginationState;
  vms: V1VirtualMachine[];
};

const VirtualMachineSelection: FC<VirtualMachineSelectionProps> = ({ pagination, vms }) => {
  const existingSelectedVMs = useExistingSelectedVMs(vms);
  const currentPageVMs = vms.slice(pagination.startIndex, pagination.endIndex);

  const isPageChecked =
    currentPageVMs.length && currentPageVMs.every((vm) => existingSelectedVMs.includes(vm));
  const isPagePartiallyChecked =
    !isPageChecked && currentPageVMs.some((vm) => existingSelectedVMs.includes(vm));

  return (
    <FlexItem className="virtual-machine-selection">
      <BulkSelect
        canSelectAll
        onSelect={(value) => handleBulkSelect(value, vms, currentPageVMs)}
        pageCount={currentPageVMs.length}
        pagePartiallySelected={isPagePartiallyChecked}
        pageSelected={isPageChecked}
        selectedCount={existingSelectedVMs.length}
        totalCount={vms.length}
      />
    </FlexItem>
  );
};

export default VirtualMachineSelection;
