import * as React from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ClipboardCopy } from '@patternfly/react-core';

type CloudInitCredentialsContentProps = {
  vm: V1VirtualMachine;
};

const CloudInitCredentialsContent: React.FC<CloudInitCredentialsContentProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { users } = getCloudInitCredentials(vm);
  const usernameTitle = t('User name: ', { count: users?.length });

  if (isEmpty(users)) {
    return <>{t('No credentials, see operating system documentation for the default username.')}</>;
  }

  return (
    <>
      <Trans ns="plugin__kubevirt-plugin">
        The following credentials for this operating system were created via cloud-init. If
        unsuccessful, cloud-init could be improperly configured. Please contact the image provider
        for more information.
      </Trans>
      <div>
        <strong>{usernameTitle}</strong>
        {users.map((user, index) => (
          <>
            {user?.name}
            {index + 1 < users?.length ? ', ' : ''}

            {user?.password && (
              <>
                <strong>{t(' Password: ')} </strong>

                <ClipboardCopy
                  variant="inline-compact"
                  isCode
                  clickTip={t('Copied')}
                  hoverTip={t('Copy to clipboard')}
                >
                  {user.password}
                </ClipboardCopy>
              </>
            )}
          </>
        ))}
      </div>
    </>
  );
};

export default CloudInitCredentialsContent;
