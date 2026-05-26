import React, { FC } from 'react';

import PendingChangesBreadcrumb from '@kubevirt-utils/components/PendingChanges/PendingChangesBreadcrumb/PendingChangesBreadcrumb';
import { getPendingChangesByTab } from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import { PendingChange } from '@kubevirt-utils/components/PendingChanges/utils/types';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { List } from '@patternfly/react-core';

type PendingChangesProps = {
  pendingChanges: PendingChange[];
};

const PendingChanges: FC<PendingChangesProps> = ({ pendingChanges }) => {
  const { t } = useKubevirtTranslation();

  const tabs = [
    VirtualMachineDetailsTab.Details,
    VirtualMachineDetailsTab.Scheduling,
    VirtualMachineDetailsTab.Environment,
    VirtualMachineDetailsTab.Network,
    VirtualMachineDetailsTab.SSH,
    VirtualMachineDetailsTab.InitialRun,
    VirtualMachineDetailsTab.Storage,
  ];

  const hasPendingChanges = pendingChanges?.some((change) => change?.hasPendingChange);

  if (!hasPendingChanges) {
    return null;
  }

  return (
    <>
      {t('The following areas have pending changes.')}
      <List>
        {tabs.map((tab) => (
          <PendingChangesBreadcrumb
            key={tab}
            pendingChanges={getPendingChangesByTab(pendingChanges, tab)}
          />
        ))}
      </List>
    </>
  );
};

export default PendingChanges;
