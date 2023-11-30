import React, { FC } from 'react';

import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
  V1VirtualMachineInstanceGuestOSUser,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isGuestAgentConnected } from '@kubevirt-utils/resources/vmi';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Card, CardBody, CardTitle, Divider } from '@patternfly/react-core';

import useActiveUsersColumnsVm from './hooks/useActiveUsersColumnsVm';
import ActiveUserListRowVm from './ActiveUserListRowVm';

type VirtualMachinesOverviewTabActiveUserProps = {
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
  guestAgentDataLoaded: boolean;
  guestAgentDataLoadError: Error;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesOverviewTabActiveUser: FC<VirtualMachinesOverviewTabActiveUserProps> = ({
  guestAgentData,
  guestAgentDataLoaded,
  guestAgentDataLoadError,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const columns = useActiveUsersColumnsVm();
  const userList = guestAgentData?.userList || [];
  const bodyTable =
    vmi && isGuestAgentConnected(vmi) ? (
      <VirtualizedTable<V1VirtualMachineInstanceGuestOSUser>
        columns={columns}
        data={userList}
        loaded={guestAgentDataLoaded}
        loadError={guestAgentDataLoadError}
        NoDataEmptyMsg={() => <Bullseye>{t('No active users')}</Bullseye>}
        Row={ActiveUserListRowVm}
        unfilteredData={userList}
      />
    ) : (
      <Bullseye>
        <MutedTextSpan
          text={vmi ? t('Guest agent is required') : t('VirtualMachine is not running')}
        />
      </Bullseye>
    );

  return (
    <Card>
      <CardTitle className="text-muted">
        {t('Active users ({{count}})', { count: userList?.length })}
      </CardTitle>
      <Divider />
      <CardBody isFilled>{bodyTable}</CardBody>
    </Card>
  );
};

export default VirtualMachinesOverviewTabActiveUser;
