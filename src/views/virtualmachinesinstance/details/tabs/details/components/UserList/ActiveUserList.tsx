import * as React from 'react';
import { useMemo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { generateRows, useDataViewTableSort } from '@kubevirt-utils/hooks/useDataViewTableSort';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Bullseye, Icon, Title } from '@patternfly/react-core';
import { DataViewTable } from '@patternfly/react-data-view';
import { LinkIcon } from '@patternfly/react-icons';

import useGuestOS from '../../../../hooks/useGuestOS';

import { getActiveUserColumns, getActiveUserRowId } from './activeUserListDefinition';

type ActiveUserListProps = {
  pathname: string;
  vmi: V1VirtualMachineInstance;
};

const ActiveUserList: React.FC<ActiveUserListProps> = ({ pathname, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [{ userList = [] }, loaded, loadError, isGuestAgentConnected] = useGuestOS(vmi);

  const columns = useMemo(() => getActiveUserColumns(t), [t]);
  const { sortedData, tableColumns } = useDataViewTableSort(userList, columns, 'userName');

  const rows = useMemo(
    () => generateRows(sortedData, columns, undefined, getActiveUserRowId),
    [sortedData, columns],
  );

  const renderContent = () => {
    if (loadError) {
      return (
        <Bullseye>
          <MutedTextSpan text={t('Error loading active users')} />
        </Bullseye>
      );
    }

    if (!loaded) {
      return (
        <Bullseye>
          <MutedTextSpan text={t('Loading...')} />
        </Bullseye>
      );
    }

    if (!isGuestAgentConnected) {
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

  return (
    <div>
      <a
        aria-label={t('Navigate to logged-in users section')}
        className="link-icon"
        href={`${pathname}#logged-in-users`}
      >
        <Icon size="sm">
          <LinkIcon />
        </Icon>
      </a>
      <Title className="co-section-heading" headingLevel="h2">
        {t('Active users')}
      </Title>
      {renderContent()}
    </div>
  );
};

export default ActiveUserList;
