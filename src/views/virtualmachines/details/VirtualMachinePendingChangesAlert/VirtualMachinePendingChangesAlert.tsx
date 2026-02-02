import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { usePendingChanges } from '@kubevirt-utils/components/PendingChanges/hooks/usePendingChanges';
import { PendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getStatusConditionByType } from '@kubevirt-utils/resources/vm';
import { VirtualMachineStatusConditionTypes } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack, StackItem } from '@patternfly/react-core';
import LiveMigratePendingChanges from '@virtualmachines/details/VirtualMachinePendingChangesAlert/LiveMigratePendingChanges';
import RestartPendingChanges from '@virtualmachines/details/VirtualMachinePendingChangesAlert/RestartPendingChanges';
import { isRunning } from '@virtualmachines/utils';

import { splitPendingChanges } from '../utils/utils';

type VirtualMachinePendingChangesAlertProps = {
  instanceTypeExpandedSpec: V1VirtualMachine;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinePendingChangesAlert: FC<VirtualMachinePendingChangesAlertProps> = ({
  instanceTypeExpandedSpec,
  vm,
  vmi,
}) => {
  const pendingChanges = usePendingChanges(vm, vmi, instanceTypeExpandedSpec);
  const { t } = useKubevirtTranslation();

  const restartRequiredCondition = getStatusConditionByType(
    vm,
    VirtualMachineStatusConditionTypes.RestartRequired,
  );

  const isRestartRequired = restartRequiredCondition?.status === 'True';
  const hasPendingChanges = pendingChanges?.some((change) => change?.hasPendingChange);

  if (!vmi || !isRunning(vm) || (!isRestartRequired && !hasPendingChanges)) {
    return null;
  }

  const { liveMigrationChanges, restartChanges } = splitPendingChanges(pendingChanges);

  return (
    <PendingChangesAlert
      isExpandable
      isWarning
      title={isRestartRequired ? t('Restart required') : undefined}
    >
      <Stack hasGutter>
        {!isEmpty(liveMigrationChanges) && (
          <StackItem>
            <LiveMigratePendingChanges pendingChanges={liveMigrationChanges} />
          </StackItem>
        )}
        {(isRestartRequired || !isEmpty(restartChanges)) && (
          <StackItem>
            <RestartPendingChanges
              pendingChanges={restartChanges}
              restartRequiredCondition={restartRequiredCondition}
            />
          </StackItem>
        )}
      </Stack>
    </PendingChangesAlert>
  );
};

export default VirtualMachinePendingChangesAlert;
