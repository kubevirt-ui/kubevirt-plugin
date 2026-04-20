import React, { FCC, ReactNode } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ActiveUsersTable from '@kubevirt-utils/components/ActiveUsersTable/ActiveUsersTable';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isGuestAgentConnected } from '@kubevirt-utils/resources/vmi';
import { Bullseye, Card, CardBody, CardTitle, Divider } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

type VirtualMachinesOverviewTabActiveUserProps = {
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
  guestAgentDataLoaded: boolean;
  guestAgentDataLoadError?: Error;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesOverviewTabActiveUser: FCC<VirtualMachinesOverviewTabActiveUserProps> = ({
  guestAgentData,
  guestAgentDataLoaded,
  guestAgentDataLoadError,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const isVMRunning = isRunning(vm);
  const userList = guestAgentData?.userList ?? [];
  const isConnected = vmi && isGuestAgentConnected(vmi);

  const renderContent = (): ReactNode => {
    if (!isVMRunning) {
      return (
        <Bullseye data-test="overview-active-users-not-running">
          <MutedTextSpan text={t('VirtualMachine is not running')} />
        </Bullseye>
      );
    }

    if (!isConnected) {
      return (
        <Bullseye data-test="overview-active-users-no-agent">
          <MutedTextSpan text={t('Guest agent is required')} />
        </Bullseye>
      );
    }

    return (
      <ActiveUsersTable
        data={userList}
        loaded={guestAgentDataLoaded}
        loadError={guestAgentDataLoadError}
      />
    );
  };

  const showUserCount =
    guestAgentDataLoaded && isConnected && !guestAgentDataLoadError && isVMRunning;

  return (
    <Card data-test="overview-active-users-card">
      <CardTitle className="pf-v6-u-text-color-subtle">
        {showUserCount
          ? t('Active users ({{users}})', { users: userList.length })
          : t('Active users')}
      </CardTitle>
      <Divider />
      <CardBody isFilled>{renderContent()}</CardBody>
    </Card>
  );
};

export default VirtualMachinesOverviewTabActiveUser;
