import React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { usePendingChanges } from '@kubevirt-utils/components/PendingChanges/hooks/usePendingChanges';
import { PendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert';
import PendingChangesBreadcrumb from '@kubevirt-utils/components/PendingChanges/PendingChangesBreadcrumb/PendingChangesBreadcrumb';
import { getPendingChangesByTab } from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { List } from '@patternfly/react-core';

import { printableVMStatus } from '../utils';

type VirtualMachinePendingChangesAlertProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinePendingChangesAlert: React.FC<VirtualMachinePendingChangesAlertProps> = ({
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const pendingChanges = usePendingChanges(vm, vmi);

  const {
    pendingChangesDetailsTab,
    pendingChangesSchedulingTab,
    pendingChangesEnvTab,
    pendingChangesNICsTab,
  } = getPendingChangesByTab(pendingChanges);

  const hasPendingChanges = pendingChanges?.some((change) => change?.hasPendingChange);

  if (!vmi || vm?.status?.printableStatus === printableVMStatus.Stopped || !hasPendingChanges) {
    return null;
  }

  return (
    <PendingChangesAlert isWarning>
      {t(
        'The following areas have pending changes that will be applied when this VirtualMachine is restarted.',
      )}
      <List>
        <PendingChangesBreadcrumb pendingChanges={pendingChangesDetailsTab} />
        <PendingChangesBreadcrumb pendingChanges={pendingChangesSchedulingTab} />
        <PendingChangesBreadcrumb pendingChanges={pendingChangesEnvTab} />
        <PendingChangesBreadcrumb pendingChanges={pendingChangesNICsTab} />
      </List>
    </PendingChangesAlert>
  );
};

export default VirtualMachinePendingChangesAlert;
