import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { usePendingChanges } from '@kubevirt-utils/components/PendingChanges/hooks/usePendingChanges';
import { PendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert';
import { getSortedNICPendingChanges } from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack, StackItem } from '@patternfly/react-core';
import LiveMigratePendingChanges from '@virtualmachines/details/VirtualMachinePendingChangesAlert/LiveMigratePendingChanges';
import RestartPendingChanges from '@virtualmachines/details/VirtualMachinePendingChangesAlert/RestartPendingChanges';
import { isRunning } from '@virtualmachines/utils';

import { showPendingChangesSections } from '../utils/utils';

type VirtualMachinePendingChangesAlertProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinePendingChangesAlert: FC<VirtualMachinePendingChangesAlertProps> = ({
  vm,
  vmi,
}) => {
  const history = useHistory();
  const pendingChanges = usePendingChanges(vm, vmi);

  const hasPendingChanges = pendingChanges?.some((change) => change?.hasPendingChange);
  const isInstanceTypeVM = !isEmpty(vm?.spec?.instancetype) || !isEmpty(vm?.spec?.preference);

  if (!vmi || !isRunning(vm) || !hasPendingChanges || isInstanceTypeVM) {
    return null;
  }

  const sortedNICHotPlugPendingChanges = getSortedNICPendingChanges(vm, vmi, history);
  const { showLiveMigrateSection, showRestartSection } = showPendingChangesSections(
    pendingChanges,
    sortedNICHotPlugPendingChanges,
  );

  return (
    <PendingChangesAlert isWarning>
      <Stack hasGutter>
        {showLiveMigrateSection && (
          <StackItem>
            <LiveMigratePendingChanges
              nicHotPlugPendingChanges={sortedNICHotPlugPendingChanges?.nicHotPlugPendingChanges}
            />
          </StackItem>
        )}
        {showRestartSection && (
          <StackItem>
            <RestartPendingChanges
              nonHotPlugPendingChanges={sortedNICHotPlugPendingChanges?.nicNonHotPlugPendingChanges}
              pendingChanges={pendingChanges}
            />
          </StackItem>
        )}
      </Stack>
    </PendingChangesAlert>
  );
};

export default VirtualMachinePendingChangesAlert;
