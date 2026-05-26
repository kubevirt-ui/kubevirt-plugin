import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { usePendingChanges } from '@kubevirt-utils/components/PendingChanges/hooks/usePendingChanges';
import { PendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert';
import { getPendingChangesByTab } from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getStatusConditionByType } from '@kubevirt-utils/resources/vm';
import { VirtualMachineStatusConditionTypes } from '@kubevirt-utils/resources/vm/utils/constants';
import PendingChanges from '@virtualmachines/details/VirtualMachinePendingChangesAlert/PendingChanges';
import { isRunning } from '@virtualmachines/utils';

import { getPendingChangesAlertTitle } from './utils/utils';
import MigrationPendingChanges from './MigrationPendingChanges';
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

  const migrationRequiredCondition = getStatusConditionByType(
    vm,
    VirtualMachineStatusConditionTypes.MigrationRequired,
  );

  const isRestartRequired = restartRequiredCondition?.status === 'True';
  const isMigrationRequired = migrationRequiredCondition?.status === 'True';
  const hasHotPlugNICChanges = pendingChangesNICsTab.length > 0;

  if (
    !vmi ||
    !isRunning(vm) ||
    (!isRestartRequired && !isMigrationRequired && !hasHotPlugNICChanges)
  ) {
    return null;
  }

  const alertTitle = getPendingChangesAlertTitle(t, isRestartRequired, isMigrationRequired);

  return (
    <PendingChangesAlert isExpandable isWarning title={alertTitle}>
      {isMigrationRequired && (
        <MigrationPendingChanges migrationRequiredCondition={migrationRequiredCondition} />
      )}
      {isRestartRequired && (
        <RestartPendingChanges
          pendingChanges={pendingChanges}
          restartRequiredCondition={restartRequiredCondition}
        />
      )}
      {!isRestartRequired && !isMigrationRequired && hasHotPlugNICChanges && (
        <PendingChanges pendingChanges={pendingChangesNICsTab} />
      )}
    </PendingChangesAlert>
  );
};

export default VirtualMachinePendingChangesAlert;
