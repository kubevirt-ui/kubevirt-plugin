import * as React from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getSSHNodePort } from '@kubevirt-utils/utils/utils';

import Loading from '../Loading/Loading';
import UserCredentials from '../UserCredentials/UserCredentials';

type SSHAccessProps = {
  sshService: IoK8sApiCoreV1Service;
  vmi: V1VirtualMachineInstance;
  sshServiceLoaded?: boolean;
};

const SSHAccess: React.FC<SSHAccessProps> = ({ sshService, sshServiceLoaded, vmi }) => {
  const { t } = useKubevirtTranslation();

  const sshServiceNodePort = getSSHNodePort(sshService);

  if (!sshServiceLoaded) return <Loading />;

  return (
    <>
      <span data-test="details-item-ssh-access-port">
        {sshService ? (
          t('Service port: {{port}}', {
            port: sshServiceNodePort,
          })
        ) : (
          <span className="text-muted">{t('SSH service disabled')} </span>
        )}
      </span>
      <UserCredentials vmi={vmi} sshService={sshService} />
    </>
  );
};

export default SSHAccess;
