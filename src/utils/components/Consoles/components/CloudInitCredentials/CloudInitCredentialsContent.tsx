import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Flex } from '@patternfly/react-core';

import { LINE_FEED } from '../vnc-console/utils/util';

import CloudInitCredentialsItem from './CloudInitCredentialsItem';
import InlineCodeClipboardCopy from './InlineCodeClipboardCopy';

import './cloud-init-credentials.scss';

type CloudInitCredentialsContentProps = {
  vm: V1VirtualMachine;
};

const CloudInitCredentialsContent: FC<CloudInitCredentialsContentProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { users } = getCloudInitCredentials(vm);

  if (!Array.isArray(users) || isEmpty(users)) {
    return (
      <div className="pf-v6-u-ml-md">
        {t('No credentials, see operating system documentation for the default username.')}
      </div>
    );
  }

  const usernameCopyButtons = users.map((user, index) => (
    <InlineCodeClipboardCopy
      clipboardText={user?.name?.concat(String.fromCharCode(LINE_FEED))}
      hideText={true}
      key={`username-copy-${index}`}
    />
  ));

  const passwordCopyButtons = users.map((user, index) => (
    <InlineCodeClipboardCopy
      clipboardText={user?.password?.concat(String.fromCharCode(LINE_FEED))}
      hideText={true}
      key={`password-copy-${index}`}
    />
  ));

  const usernames = users.map((user) => user?.name || '');
  const passwords = users.map((user) => user?.password || '');

  return (
    <Flex className="cloud-init-credentials-user-pass">
      <CloudInitCredentialsItem
        button-data-test="username-show-hide-button"
        copyButtons={usernameCopyButtons}
        credentials={usernames}
        credentialTitle={t('User name')}
        hideCredentialText={t('Hide username')}
        showCredentialText={t('Show username')}
      />
      <CloudInitCredentialsItem
        button-data-test="password-show-hide-button"
        copyButtons={passwordCopyButtons}
        credentials={passwords}
        credentialTitle={t('Password')}
        hideCredentialText={t('Hide password')}
        showCredentialText={t('Show password')}
      />
    </Flex>
  );
};

export default CloudInitCredentialsContent;
