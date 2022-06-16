import * as React from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getSSHNodePort } from '@kubevirt-utils/utils/utils';

type SSHAccessProps = {
  sshService: IoK8sApiCoreV1Service;
};

const SSHAccess: React.FC<SSHAccessProps> = ({ sshService }) => {
  const { t } = useKubevirtTranslation();

  const sshServiceNodePort = getSSHNodePort(sshService);

  return (
    <span data-test="details-item-ssh-access-port">
      {sshService ? (
        t('port: {{port}}', {
          port: sshServiceNodePort,
        })
      ) : (
        <span className="text-muted">{t('SSH service disabled')} </span>
      )}
    </span>
  );
};

export default SSHAccess;
