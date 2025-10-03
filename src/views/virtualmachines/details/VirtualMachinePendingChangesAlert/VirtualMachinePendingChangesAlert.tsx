import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { usePendingChanges } from '@kubevirt-utils/components/PendingChanges/hooks/usePendingChanges';
import { PendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert';
import { getPendingChangesByTab } from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getStatusConditionByType } from '@kubevirt-utils/resources/vm';
import { VirtualMachineStatusConditionTypes } from '@kubevirt-utils/resources/vm/utils/constants';
import PendingChanges from '@virtualmachines/details/VirtualMachinePendingChangesAlert/PendingChanges';
import { isRunning } from '@virtualmachines/utils';

import RestartPendingChanges from './RestartPendingChanges';

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

  const pendingChangesNICsTab = getPendingChangesByTab(
    pendingChanges ?? [],
    VirtualMachineDetailsTab.Network,
  );

  const restartRequiredCondition = getStatusConditionByType(
    vm,
    VirtualMachineStatusConditionTypes.RestartRequired,
  );

  const isRestartRequired = restartRequiredCondition?.status === 'True';

  if (!vmi || !isRunning(vm) || (!isRestartRequired && !pendingChangesNICsTab.length)) {
    return null;
  }
  return (
    <PendingChangesAlert
      isExpandable
      isWarning
      title={isRestartRequired ? t('Restart required') : undefined}
    >
      {isRestartRequired && (
        <RestartPendingChanges
          pendingChanges={pendingChanges}
          restartRequiredCondition={restartRequiredCondition}
        />
      )}
      {!isRestartRequired && pendingChangesNICsTab.length > 0 && (
        <PendingChanges pendingChanges={pendingChangesNICsTab} />
      )}
    </PendingChangesAlert>
  );
};

export default VirtualMachinePendingChangesAlert;
