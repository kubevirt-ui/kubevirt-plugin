import React, { FC } from 'react';

import { V1VirtualMachineCondition } from '@kubevirt-ui/kubevirt-api/kubevirt';
import PendingChangesBreadcrumb from '@kubevirt-utils/components/PendingChanges/PendingChangesBreadcrumb/PendingChangesBreadcrumb';
import { getPendingChangesByTab } from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import { PendingChange } from '@kubevirt-utils/components/PendingChanges/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { List } from '@patternfly/react-core';

type RestartPendingChangesProps = {
  pendingChanges: PendingChange[];
  restartRequiredCondition?: V1VirtualMachineCondition;
};

const RestartPendingChanges: FC<RestartPendingChangesProps> = ({
  pendingChanges,
  restartRequiredCondition,
}) => {
  const { t } = useKubevirtTranslation();

  const pendingChangesTabs = getPendingChangesByTab(pendingChanges);
  const {
    pendingChangesDetailsTab,
    pendingChangesDisksTab,
    pendingChangesEnvTab,
    pendingChangesNICsTab,
    pendingChangesSchedulingTab,
    pendingChangesScriptsTab,
  } = pendingChangesTabs;

  return (
    <span>
      {restartRequiredCondition?.message ||
        t(
          'The following areas have pending changes that will be applied when this VirtualMachine is restarted.',
        )}

      <List>
        <PendingChangesBreadcrumb pendingChanges={pendingChangesDetailsTab} />
        <PendingChangesBreadcrumb pendingChanges={pendingChangesSchedulingTab} />
        <PendingChangesBreadcrumb pendingChanges={pendingChangesEnvTab} />
        <PendingChangesBreadcrumb pendingChanges={pendingChangesNICsTab} />
        <PendingChangesBreadcrumb pendingChanges={pendingChangesScriptsTab} />
        <PendingChangesBreadcrumb pendingChanges={pendingChangesDisksTab} />
      </List>
    </span>
  );
};

export default RestartPendingChanges;
