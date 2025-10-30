import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { ERROR, OTHER } from '@overview/OverviewTab/vm-statuses-card/utils/constants';
import {
  getOtherStatuses,
  getVMStatuses,
} from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import VMStatusItem from '@overview/OverviewTab/vm-statuses-card/VMStatusItem';
import { Flex } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

type VirtualMachineStatusesProps = {
  className?: string;
  onFilterChange?: OnFilterChange;
  vms: V1VirtualMachine[];
};

const VirtualMachineStatuses: FC<VirtualMachineStatusesProps> = ({
  className,
  onFilterChange,
  vms,
}) => {
  const { otherStatusesCount, primaryStatuses } = getVMStatuses(vms || []);
  const OTHER_STATUSES = getOtherStatuses();

  const onStatusChange = (statusArray: typeof ERROR[] | VM_STATUS[]) => () =>
    onFilterChange(VirtualMachineRowFilterType.Status, { selected: statusArray });

  return (
    <Flex
      className={className}
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
      spaceItems={{ default: 'spaceItemsLg' }}
    >
      <VMStatusItem
        count={primaryStatuses.Error}
        isFlexItem
        onFilterChange={onStatusChange([ERROR])}
        statusArray={[ERROR]}
        statusLabel={ERROR}
      />
      <VMStatusItem
        count={primaryStatuses.Running}
        isFlexItem
        onFilterChange={onStatusChange([VM_STATUS.Running])}
        statusArray={[VM_STATUS.Running]}
        statusLabel={VM_STATUS.Running}
      />
      <VMStatusItem
        count={primaryStatuses.Stopped}
        isFlexItem
        onFilterChange={onStatusChange([VM_STATUS.Stopped])}
        statusArray={[VM_STATUS.Stopped]}
        statusLabel={VM_STATUS.Stopped}
      />
      <VMStatusItem
        count={otherStatusesCount}
        isFlexItem
        onFilterChange={onStatusChange(OTHER_STATUSES)}
        statusArray={OTHER_STATUSES}
        statusLabel={OTHER}
      />
    </Flex>
  );
};

export default VirtualMachineStatuses;
