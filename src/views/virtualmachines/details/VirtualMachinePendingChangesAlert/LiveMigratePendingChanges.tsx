import React, { FC } from 'react';

import PendingChangesBreadcrumb from '@kubevirt-utils/components/PendingChanges/PendingChangesBreadcrumb/PendingChangesBreadcrumb';
import { PendingChange } from '@kubevirt-utils/components/PendingChanges/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { List } from '@patternfly/react-core';

type LiveMigratePendingChangesProps = {
  nicHotPlugPendingChanges: PendingChange[];
};

const LiveMigratePendingChanges: FC<LiveMigratePendingChangesProps> = ({
  nicHotPlugPendingChanges,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {t(
        'The following areas have pending changes that will be applied when this VirtualMachine is live migrated or restarted.',
      )}
      <List>
        <PendingChangesBreadcrumb pendingChanges={nicHotPlugPendingChanges} />
      </List>
    </>
  );
};

export default LiveMigratePendingChanges;
