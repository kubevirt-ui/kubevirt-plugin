import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Flex, FlexItem } from '@patternfly/react-core';

import InlineCodeClipboardCopy from './InlineCodeClipboardCopy';

type CloudInitCredentialsContentProps = {
  vm: V1VirtualMachine;
};

const CloudInitCredentialsContent: FC<CloudInitCredentialsContentProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { users } = getCloudInitCredentials(vm);

  if (isEmpty(users)) {
    return <>{t('No credentials, see operating system documentation for the default username.')}</>;
  }

  const { passwords, usernames } = users.reduce(
    (acc, user) => ({
      passwords: (
        <>
          {acc.passwords}
          <InlineCodeClipboardCopy
            clipboardText={user?.password?.concat(String.fromCharCode(13))}
          />
        </>
      ),
      usernames: (
        <>
          {acc.usernames}
          <InlineCodeClipboardCopy clipboardText={user?.name?.concat(String.fromCharCode(13))} />
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
