import React from 'react';
import { useHistory } from 'react-router-dom';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { usePendingChanges } from '@kubevirt-utils/components/PendingChanges/hooks/usePendingChanges';
import { PendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert';
import PendingChangesBreadcrumb from '@kubevirt-utils/components/PendingChanges/PendingChangesBreadcrumb/PendingChangesBreadcrumb';
import {
  getPendingChangesByTab,
  getSortedNICPendingChanges,
  hasPendingChange,
  nonHotPlugNICChangesExist,
} from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import { BRIDGED_NIC_HOTPLUG_ENABLED } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
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
  const history = useHistory();
  const pendingChanges = usePendingChanges(vm, vmi);
  const { featureEnabled: bridgeNICHotPlugEnabled } = useFeatures(BRIDGED_NIC_HOTPLUG_ENABLED);

  const {
    pendingChangesDetailsTab,
    pendingChangesDisksTab,
    pendingChangesEnvTab,
    pendingChangesNICsTab,
    pendingChangesSchedulingTab,
    pendingChangesScriptsTab,
  } = getPendingChangesByTab(pendingChanges);

  const hotPlugNICPendingChanges = getSortedNICPendingChanges(vm, vmi, history);
  const { hotPlugPendingChanges, nonHotPlugPendingChanges } = hotPlugNICPendingChanges;

  const hasPendingChanges = pendingChanges?.some((change) => change?.hasPendingChange);

  const isInstanceTypeVM = !isEmpty(vm?.spec?.instancetype) || !isEmpty(vm?.spec?.preference);

  const showLiveMigrateSection = bridgeNICHotPlugEnabled && hasPendingChange(hotPlugPendingChanges);
  const showRestartSection =
    !bridgeNICHotPlugEnabled ||
    nonHotPlugNICChangesExist(pendingChanges, hasPendingChange(nonHotPlugPendingChanges));
  const showBothSections = showLiveMigrateSection && showRestartSection;

  if (
    !vmi ||
    vm?.status?.printableStatus === printableVMStatus.Stopped ||
    !hasPendingChanges ||
    isInstanceTypeVM
  ) {
    return null;
  }

  // TODO Clean up. Split into separate components
  return (
    <PendingChangesAlert isWarning>
      {showLiveMigrateSection && (
        <span>
          {t(
            'The following areas have pending changes that will be applied when this VirtualMachine is live migrated or restarted.',
          )}
          <List>
            <PendingChangesBreadcrumb pendingChanges={hotPlugPendingChanges} />
          </List>
        </span>
      )}
      {showBothSections && <br />}
      {showRestartSection && (
        <span>
          {t(
            'The following areas have pending changes that will be applied when this VirtualMachine is restarted.',
          )}

          <List>
            <PendingChangesBreadcrumb pendingChanges={pendingChangesDetailsTab} />
            <PendingChangesBreadcrumb pendingChanges={pendingChangesSchedulingTab} />
            <PendingChangesBreadcrumb pendingChanges={pendingChangesEnvTab} />
            {!bridgeNICHotPlugEnabled && (
              <PendingChangesBreadcrumb pendingChanges={pendingChangesNICsTab} />
            )}
            {bridgeNICHotPlugEnabled && hasPendingChange(nonHotPlugPendingChanges) && (
              <PendingChangesBreadcrumb pendingChanges={nonHotPlugPendingChanges} />
            )}
            <PendingChangesBreadcrumb pendingChanges={pendingChangesScriptsTab} />
            <PendingChangesBreadcrumb pendingChanges={pendingChangesDisksTab} />
          </List>
        </span>
      )}
    </PendingChangesAlert>
  );
};

export default VirtualMachinePendingChangesAlert;
