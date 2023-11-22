import * as React from 'react';

import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestOSUser,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Title } from '@patternfly/react-core';
import { LinkIcon } from '@patternfly/react-icons';

import useGuestOS from '../../../../hooks/useGuestOS';

import useActiveUsersColumns from './hooks/useActiveUsersColumns';
import ActiveUserListRow from './ActiveUserListRow';

type ActiveUserListProps = {
  pathname: string;
  vmi: V1VirtualMachineInstance;
};

const ActiveUserList: React.FC<ActiveUserListProps> = ({ pathname, vmi }) => {
  const { t } = useKubevirtTranslation();
  const columns = useActiveUsersColumns();
  const [{ userList = [] }, loaded, , isGuestAgentConnected] = useGuestOS(vmi);

  return (
    <div>
      <a className="link-icon" href={`${pathname}#logged-in-users`}>
        <LinkIcon size="sm" />
      </a>
      <Title className="co-section-heading" headingLevel="h2">
        {t('Active users')}
      </Title>
      {isGuestAgentConnected ? (
        <VirtualizedTable<V1VirtualMachineInstanceGuestOSUser>
          NoDataEmptyMsg={() => (
            <Bullseye>
              <MutedTextSpan text={t('No active users')} />
            </Bullseye>
          )}
          columns={columns}
          data={userList}
          loaded={loaded}
          loadError={false}
          Row={ActiveUserListRow}
          unfilteredData={userList}
        />
      ) : (
        <Bullseye>
          <MutedTextSpan text={t('Guest agent is required')} />
        </Bullseye>
      )}
    </div>
  );
};

export default ActiveUserList;
