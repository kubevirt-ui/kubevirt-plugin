import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack, StackItem } from '@patternfly/react-core';

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
          {acc.passwords} <InlineCodeClipboardCopy clipboardText={user.password} />
        </>
      ),
      usernames: (
        <>
          {acc.usernames} <InlineCodeClipboardCopy clipboardText={user.name} />
        </>
      ),
    }),
    { passwords: <></>, usernames: <></> },
  );
  return (
    <Stack>
      <Stack hasGutter>
        <Stack>
          <StackItem>
            {t(
              'The following credentials for this operating system were created via cloud-init. If unsuccessful, cloud-init could be improperly configured.',
            )}
          </StackItem>
          <StackItem>{t('Contact the image provider for more information.')}</StackItem>
        </Stack>
        <StackItem>
          <strong>{t('User name')}</strong> {usernames}
        </StackItem>
        <StackItem>
          <strong>{t('Password')}</strong> {passwords}
        </StackItem>
      </Stack>
    </Stack>
  );
};

export default CloudInitCredentialsContent;
