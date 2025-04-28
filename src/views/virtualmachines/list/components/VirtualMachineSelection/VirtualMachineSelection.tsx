import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { BulkSelect } from '@patternfly/react-component-groups/dist/dynamic/BulkSelect';
import { FlexItem } from '@patternfly/react-core';
import useExistingSelectedVMs from '@virtualmachines/list/hooks/useExistingSelectedVMs';

import { handleBulkSelect } from './utils/bulkSelect';

import './virtual-machine-selection.scss';

type VirtualMachineSelectionProps = {
  currentPageVMs: V1VirtualMachine[];
  loaded?: boolean;
  vms: V1VirtualMachine[];
};

const VirtualMachineSelection: FC<VirtualMachineSelectionProps> = ({
  currentPageVMs,
  loaded,
  vms,
}) => {
  const existingSelectedVMs = useExistingSelectedVMs(vms);

  if (!loaded) return null;

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
