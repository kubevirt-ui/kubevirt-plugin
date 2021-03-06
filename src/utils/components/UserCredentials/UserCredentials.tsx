import * as React from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClipboardCopy } from '@patternfly/react-core';

import useSSHCommand from './useSSHCommand';

type UserCredentialsProps = {
  vmi: V1VirtualMachineInstance;
  sshService: IoK8sApiCoreV1Service;
};

const UserCredentials: React.FC<UserCredentialsProps> = ({ vmi, sshService }) => {
  const { t } = useKubevirtTranslation();
  const { command, sshServiceRunning } = useSSHCommand(vmi, sshService);

  if (!sshServiceRunning) return null;

  return (
    <ClipboardCopy
      isReadOnly
      data-test="SSHDetailsPage-command"
      clickTip={t('Copied')}
      hoverTip={t('Copy to clipboard')}
    >
      {command}
    </ClipboardCopy>
  );
};

export default UserCredentials;
