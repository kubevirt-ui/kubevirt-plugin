import React, { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getK8sSelectionId } from '@kubevirt-utils/components/KubevirtTable/utils';
import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
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
  const selectedIds = new Set(existingSelectedVMs.map((vm) => getK8sSelectionId(vm)));

  const isPageChecked =
    currentPageVMs.length && currentPageVMs.every((vm) => selectedIds.has(getK8sSelectionId(vm)));
  const isPagePartiallyChecked =
    !isPageChecked && currentPageVMs.some((vm) => selectedIds.has(getK8sSelectionId(vm)));

  return (
    <FlexItem className="virtual-machine-selection">
      <BulkSelect
        canSelectAll
        onSelect={(value) => handleBulkSelect(value, vms, currentPageVMs, existingSelectedVMs)}
        pageCount={currentPageVMs.length}
        pagePartiallySelected={isPagePartiallyChecked}
        pageSelected={Boolean(isPageChecked)}
        selectedCount={existingSelectedVMs.length}
        totalCount={vms.length}
      />
    </FlexItem>
  );
};

export default VirtualMachineSelection;
