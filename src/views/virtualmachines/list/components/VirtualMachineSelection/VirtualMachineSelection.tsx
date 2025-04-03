import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import {
  BulkSelect,
  BulkSelectValue,
} from '@patternfly/react-component-groups/dist/dynamic/BulkSelect';
import { FlexItem } from '@patternfly/react-core';
import useExistingSelectedVMs from '@virtualmachines/list/hooks/useExistingSelectedVMs';

import { deselectAll, selectAll } from '../../selectedVMs';

import './virtual-machine-selection.scss';

type VirtualMachineSelectionProps = {
  loaded?: boolean;
  pagination: PaginationState;
  vms: V1VirtualMachine[];
};

const VirtualMachineSelection: FC<VirtualMachineSelectionProps> = ({ loaded, pagination, vms }) => {
  const existingSelectedVMs = useExistingSelectedVMs(vms);

  if (!loaded) return null;

  const currentPageVMs = vms?.slice(pagination.startIndex, pagination.endIndex);
  const currentPageVMsSet = new Set(currentPageVMs);

  const numCurrentPageVMs = currentPageVMs.length;

  const isPageChecked = currentPageVMs.every((vm) => existingSelectedVMs.includes(vm));
  const isPagePartiallyChecked =
    !isPageChecked && currentPageVMs.some((vm) => existingSelectedVMs.includes(vm));

  const handleBulkSelect = (value: BulkSelectValue) => {
    value === BulkSelectValue.none && deselectAll();
    value === BulkSelectValue.page && selectAll(currentPageVMs);
    value === BulkSelectValue.all && selectAll(vms);
    value === BulkSelectValue.nonePage && selectAll(vms.filter((vm) => !currentPageVMsSet.has(vm)));
  };

  return (
    <FlexItem className="virtual-machine-selection">
      <BulkSelect
        canSelectAll
        onSelect={handleBulkSelect}
        pageCount={numCurrentPageVMs}
        pagePartiallySelected={isPagePartiallyChecked}
        pageSelected={isPageChecked}
        selectedCount={existingSelectedVMs.length}
        totalCount={vms.length}
      />
    </FlexItem>
  );
};

export default VirtualMachineSelection;
