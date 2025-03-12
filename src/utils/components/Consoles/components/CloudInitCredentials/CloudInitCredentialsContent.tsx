import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Flex, FlexItem } from '@patternfly/react-core';

import { LINE_FEED } from '../vnc-console/utils/util';

import InlineCodeClipboardCopy from './InlineCodeClipboardCopy';

type CloudInitCredentialsContentProps = {
  vm: V1VirtualMachine;
};

const CloudInitCredentialsContent: FC<CloudInitCredentialsContentProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { users } = getCloudInitCredentials(vm);

  if (isEmpty(users)) {
    return (
      <div className="pf-v6-u-ml-md">
        {t('No credentials, see operating system documentation for the default username.')}
      </div>
    );
  }

  const { passwords, usernames } = users.reduce(
    (acc, user) => ({
      passwords: (
        <>
          {acc.passwords}
          <InlineCodeClipboardCopy
            clipboardText={user?.password?.concat(String.fromCharCode(LINE_FEED))}
          />
        </>
      ),
      usernames: (
        <>
          {acc.usernames}
          <InlineCodeClipboardCopy
            clipboardText={user?.name?.concat(String.fromCharCode(LINE_FEED))}
          />
        </>
      ),
    }),
    { passwords: <></>, usernames: <></> },
  );
  return (
    <Flex className="cloud-init-credentials-user-pass">
      <FlexItem>
        {t('User name')} {usernames}
      </FlexItem>
      <FlexItem>
        {t('Password')} {passwords}
      </FlexItem>
    </Flex>
  );
};

export default CloudInitCredentialsContent;
