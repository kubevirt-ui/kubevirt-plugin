import React from 'react';

import PendingChangesBreadcrumb from '@kubevirt-utils/components/PendingChanges/PendingChangesBreadcrumb/PendingChangesBreadcrumb';
import { hasPendingChange } from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import { PendingChange } from '@kubevirt-utils/components/PendingChanges/utils/types';
import { BRIDGED_NIC_HOTPLUG_ENABLED } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { List } from '@patternfly/react-core';

type LiveMigratePendingChangesProps = {
  nicHotPlugPendingChanges: PendingChange[];
};

const LiveMigratePendingChanges: React.FC<LiveMigratePendingChangesProps> = ({
  nicHotPlugPendingChanges,
}) => {
  const { t } = useKubevirtTranslation();
  const { featureEnabled: nicHotPlugEnabled } = useFeatures(BRIDGED_NIC_HOTPLUG_ENABLED);

  const showLiveMigrateSection = nicHotPlugEnabled && hasPendingChange(nicHotPlugPendingChanges);
  if (!showLiveMigrateSection) return null;

  return (
    <span>
      {t(
        'The following areas have pending changes that will be applied when this VirtualMachine is live migrated or restarted.',
      )}
      <List>
        <PendingChangesBreadcrumb pendingChanges={nicHotPlugPendingChanges} />
      </List>
    </span>
  );
};

export default LiveMigratePendingChanges;
