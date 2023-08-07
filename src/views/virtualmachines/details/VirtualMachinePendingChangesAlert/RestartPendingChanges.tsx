import React from 'react';

import PendingChangesBreadcrumb from '@kubevirt-utils/components/PendingChanges/PendingChangesBreadcrumb/PendingChangesBreadcrumb';
import {
  getPendingChangesByTab,
  hasPendingChange,
  nonHotPlugNICChangesExist,
} from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import { PendingChange } from '@kubevirt-utils/components/PendingChanges/utils/types';
import { BRIDGED_NIC_HOTPLUG_ENABLED } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { List } from '@patternfly/react-core';

type RestartPendingChangesProps = {
  nonHotPlugPendingChanges: PendingChange[];
  pendingChanges: PendingChange[];
};

const RestartPendingChanges: React.FC<RestartPendingChangesProps> = ({
  nonHotPlugPendingChanges,
  pendingChanges,
}) => {
  const { t } = useKubevirtTranslation();
  const { featureEnabled: nicHotPlugEnabled } = useFeatures(BRIDGED_NIC_HOTPLUG_ENABLED);
  const pendingChangesTabs = getPendingChangesByTab(pendingChanges);
  const {
    pendingChangesDetailsTab,
    pendingChangesDisksTab,
    pendingChangesEnvTab,
    pendingChangesNICsTab,
    pendingChangesSchedulingTab,
    pendingChangesScriptsTab,
  } = pendingChangesTabs;
  const showRestartSection =
    !nicHotPlugEnabled ||
    nonHotPlugNICChangesExist(pendingChanges, hasPendingChange(nonHotPlugPendingChanges)) ||
    Object.values(pendingChangesTabs).some((changes) => changes.length > 0);
  if (!showRestartSection) return null;

  return (
    <span>
      {t(
        'The following areas have pending changes that will be applied when this VirtualMachine is restarted.',
      )}

      <List>
        <PendingChangesBreadcrumb pendingChanges={pendingChangesDetailsTab} />
        <PendingChangesBreadcrumb pendingChanges={pendingChangesSchedulingTab} />
        <PendingChangesBreadcrumb pendingChanges={pendingChangesEnvTab} />
        {!nicHotPlugEnabled && <PendingChangesBreadcrumb pendingChanges={pendingChangesNICsTab} />}
        {nicHotPlugEnabled && hasPendingChange(nonHotPlugPendingChanges) && (
          <PendingChangesBreadcrumb pendingChanges={nonHotPlugPendingChanges} />
        )}
        <PendingChangesBreadcrumb pendingChanges={pendingChangesScriptsTab} />
        <PendingChangesBreadcrumb pendingChanges={pendingChangesDisksTab} />
      </List>
    </span>
  );
};

export default RestartPendingChanges;
