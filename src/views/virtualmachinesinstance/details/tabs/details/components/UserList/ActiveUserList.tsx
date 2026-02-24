import React, { FC, ReactNode } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ActiveUsersTable from '@kubevirt-utils/components/ActiveUsersTable/ActiveUsersTable';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye, Icon, Title } from '@patternfly/react-core';
import { LinkIcon } from '@patternfly/react-icons';

import useGuestOS from '../../../../hooks/useGuestOS';

type ActiveUserListProps = {
  pathname: string;
  vmi: V1VirtualMachineInstance;
};

const ActiveUserList: FC<ActiveUserListProps> = ({ pathname, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [{ userList = [] }, loaded, loadError, isGuestAgentConnected] = useGuestOS(vmi);

  const renderContent = (): ReactNode => {
    if (!isGuestAgentConnected && loaded && !loadError) {
      return (
        <Bullseye data-test="active-users-no-agent">
          <MutedTextSpan text={t('Guest agent is required')} />
        </Bullseye>
      );
    }

    return <ActiveUsersTable data={userList} loaded={loaded} loadError={loadError} />;
  };

  return (
    <div id="logged-in-users">
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
