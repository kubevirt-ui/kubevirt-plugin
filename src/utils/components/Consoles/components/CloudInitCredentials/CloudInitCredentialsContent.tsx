import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Flex } from '@patternfly/react-core';

import CloudInitCredentialsItem from './CloudInitCredentialsItem';

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

  return (
    <>
      {users.map((user) => (
        <Flex className="cloud-init-credentials-user-pass" key={user.name}>
          <CloudInitCredentialsItem
            button-data-test="username-show-hide-button"
            credentials={user?.name || ''}
            credentialTitle={t('User name')}
            hideCredentialText={t('Hide username')}
            showCredentialText={t('Show username')}
          />
          <CloudInitCredentialsItem
            button-data-test="password-show-hide-button"
            credentials={user?.password || ''}
            credentialTitle={t('Password')}
            hideCredentialText={t('Hide password')}
            showCredentialText={t('Show password')}
          />
        </Flex>
      ))}
    </>
  );
};

export default CloudInitCredentialsContent;
