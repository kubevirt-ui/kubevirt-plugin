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
  vmi: V1VirtualMachineInstance;
  pathname: string;
};

const ActiveUserList: React.FC<ActiveUserListProps> = ({ vmi, pathname }) => {
  const { t } = useKubevirtTranslation();
  const columns = useActiveUsersColumns();
  const [{ userList = [] }, loaded, , isGuestAgentConnected] = useGuestOS(vmi);

  return (
    <div>
      <a href={`${pathname}#logged-in-users`} className="link-icon">
        <LinkIcon size="sm" />
      </a>
      <Title headingLevel="h2" className="co-section-heading">
        {t('Active Users')}
      </Title>
      {isGuestAgentConnected ? (
        <VirtualizedTable<V1VirtualMachineInstanceGuestOSUser>
          data={userList}
          unfilteredData={userList}
          loaded={loaded}
          loadError={false}
          columns={columns}
          Row={ActiveUserListRow}
          NoDataEmptyMsg={() => (
            <Bullseye>
              <MutedTextSpan text={t('No Active Users')} />
            </Bullseye>
          )}
        />
      ) : (
        <Bullseye>
          <MutedTextSpan text={t('Guest Agent is required')} />
        </Bullseye>
      )}
    </div>
  );
};

export default ActiveUserList;
