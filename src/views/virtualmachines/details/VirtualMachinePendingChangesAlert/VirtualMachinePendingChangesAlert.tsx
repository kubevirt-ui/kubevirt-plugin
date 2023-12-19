import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { usePendingChanges } from '@kubevirt-utils/components/PendingChanges/hooks/usePendingChanges';
import { PendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack, StackItem } from '@patternfly/react-core';
import LiveMigratePendingChanges from '@virtualmachines/details/VirtualMachinePendingChangesAlert/LiveMigratePendingChanges';
import RestartPendingChanges from '@virtualmachines/details/VirtualMachinePendingChangesAlert/RestartPendingChanges';
import { isRunning } from '@virtualmachines/utils';

import { splitPendingChanges } from '../utils/utils';

type VirtualMachinePendingChangesAlertProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinePendingChangesAlert: FC<VirtualMachinePendingChangesAlertProps> = ({
  vm,
  vmi,
}) => {
  const pendingChanges = usePendingChanges(vm, vmi);

  const hasPendingChanges = pendingChanges?.some((change) => change?.hasPendingChange);

  if (!vmi || !isRunning(vm) || !hasPendingChanges) {
    return null;
  }

  const { liveMigrationChanges, restartChanges } = splitPendingChanges(pendingChanges);

  return (
    <PendingChangesAlert isWarning>
      <Stack hasGutter>
        {!isEmpty(liveMigrationChanges) && (
          <StackItem>
            <LiveMigratePendingChanges pendingChanges={liveMigrationChanges} />
          </StackItem>
        )}
        {!isEmpty(restartChanges) && (
          <StackItem>
            <RestartPendingChanges pendingChanges={restartChanges} />
          </StackItem>
        )}
      </Stack>
    </PendingChangesAlert>
  );
};

export default VirtualMachinePendingChangesAlert;
