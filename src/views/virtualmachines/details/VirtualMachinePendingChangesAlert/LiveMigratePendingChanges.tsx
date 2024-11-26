import React, { FC } from 'react';

import PendingChangesBreadcrumb from '@kubevirt-utils/components/PendingChanges/PendingChangesBreadcrumb/PendingChangesBreadcrumb';
import { getPendingChangesByTab } from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import { PendingChange } from '@kubevirt-utils/components/PendingChanges/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { List } from '@patternfly/react-core';

type LiveMigratePendingChangesProps = {
  pendingChanges: PendingChange[];
};

const LiveMigratePendingChanges: FC<LiveMigratePendingChangesProps> = ({ pendingChanges }) => {
  const { t } = useKubevirtTranslation();

  const { pendingChangesNICsTab } = getPendingChangesByTab(pendingChanges);

  return (
    <>
      {t(
        'The following areas have pending changes that will be applied when this VirtualMachine is live migrated or restarted.',
      )}
      <List>
        <PendingChangesBreadcrumb pendingChanges={pendingChangesNICsTab} />
      </List>
    </>
  );
};

export default LiveMigratePendingChanges;
