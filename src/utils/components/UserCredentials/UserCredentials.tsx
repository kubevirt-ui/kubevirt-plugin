import * as React from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClipboardCopy } from '@patternfly/react-core';

import useSSHCommand from './useSSHCommand';

type UserCredentialsProps = {
  vmi: V1VirtualMachineInstance;
  sshService: IoK8sApiCoreV1Service;
};

const UserCredentials: React.FC<UserCredentialsProps> = ({ vmi, sshService }) => {
  const { t } = useKubevirtTranslation();
  const { user, command, sshServiceRunning } = useSSHCommand(vmi, sshService);

  return (
    <>
      <span data-test="details-item-user-credentials-user-name">
        {t('user: {{user}}', { user })}
      </span>
      <ClipboardCopy isReadOnly data-test="SSHDetailsPage-command">
        {sshServiceRunning ? command : `ssh ${user}@`}
      </ClipboardCopy>
      {!sshServiceRunning && <MutedTextSpan text={t('Requires SSH service')} />}
    </>
  );
};

export default UserCredentials;
