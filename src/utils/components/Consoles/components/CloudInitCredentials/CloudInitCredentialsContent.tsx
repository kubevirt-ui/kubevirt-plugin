import * as React from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import { ClipboardCopy } from '@patternfly/react-core';

import { CLOUD_INIT_MISSING_USERNAME } from '../../utils/constants';

type CloudInitCredentialsContentProps = {
  vmi: V1VirtualMachineInstance;
};

const CloudInitCredentialsContent: React.FC<CloudInitCredentialsContentProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { user, password } = getCloudInitCredentials(vmi);

  if (!user && !password) {
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
        <strong>{t('User name: ')}</strong>
        {user || CLOUD_INIT_MISSING_USERNAME}

        {password && (
          <>
            <strong>{t(' Password: ')} </strong>

            <ClipboardCopy
              variant="inline-compact"
              isCode
              clickTip={t('Copied')}
              hoverTip={t('Copy to clipboard')}
            >
              {password}
            </ClipboardCopy>
          </>
        )}
      </div>
    </>
  );
};

export default CloudInitCredentialsContent;
