import React, { FC, useMemo } from 'react';

import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { generateRows, useDataViewTableSort } from '@kubevirt-utils/hooks/useDataViewTableSort';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isGuestAgentConnected } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Bullseye, Card, CardBody, CardTitle, Divider } from '@patternfly/react-core';
import { DataViewTable } from '@patternfly/react-data-view';

import {
  getActiveUserColumns,
  getActiveUserRowId,
} from '../../../../../../virtualmachinesinstance/details/tabs/details/components/UserList/activeUserListDefinition';

type VirtualMachinesOverviewTabActiveUserProps = {
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
  guestAgentDataLoaded: boolean;
  guestAgentDataLoadError?: Error;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesOverviewTabActiveUser: FC<VirtualMachinesOverviewTabActiveUserProps> = ({
  guestAgentData,
  guestAgentDataLoaded,
  guestAgentDataLoadError,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const userList = guestAgentData?.userList || [];

  const columns = useMemo(() => getActiveUserColumns(t), [t]);
  const { sortedData, tableColumns } = useDataViewTableSort(userList, columns, 'userName');

  const rows = useMemo(
    () => generateRows(sortedData, columns, undefined, getActiveUserRowId),
    [sortedData, columns],
  );

  const isConnected = vmi && isGuestAgentConnected(vmi);

  const renderContent = () => {
    if (!vmi) {
      return (
        <Bullseye>
          <MutedTextSpan text={t('VirtualMachine is not running')} />
        </Bullseye>
      );
    }

    if (guestAgentDataLoadError) {
      return (
        <Bullseye>
          <MutedTextSpan text={t('Error loading active users')} />
        </Bullseye>
      );
    }

    if (!guestAgentDataLoaded) {
      return (
        <Bullseye>
          <MutedTextSpan text={t('Loading...')} />
        </Bullseye>
      );
    }

    if (!isConnected) {
      return (
        <Bullseye>
          <MutedTextSpan text={t('Guest agent is required')} />
        </Bullseye>
      );
    }

    if (isEmpty(userList)) {
      return (
        <Bullseye>
          <MutedTextSpan text={t('No active users')} />
        </Bullseye>
      );
    }

    return (
      <DataViewTable aria-label={t('Active users table')} columns={tableColumns} rows={rows} />
    );
  };

  const showUserCount = guestAgentDataLoaded && isConnected && !guestAgentDataLoadError;

  return (
    <Card>
      <CardTitle className="pf-v6-u-text-color-subtle">
        {showUserCount
          ? t('Active users ({{users}})', { users: userList?.length })
          : t('Active users')}
      </CardTitle>
      <Divider />
      <CardBody isFilled>{renderContent()}</CardBody>
    </Card>
  );
};

export default VirtualMachinesOverviewTabActiveUser;
