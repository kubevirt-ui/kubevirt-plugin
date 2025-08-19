import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useSSHCommand from '@kubevirt-utils/components/SSHAccess/useSSHCommand';
import useSSHService from '@kubevirt-utils/components/SSHAccess/useSSHService';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClipboardCopy } from '@patternfly/react-core';
import { isVMIReady } from '@topology/utils/selectors/selectors';

import '../../../../TopologyVMDetailsPanel.scss';
import './VMUserCredentialsDetailsItem.scss';

type VMUserCredentialsDetailsItemProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VMUserCredentialsDetailsItem: FC<VMUserCredentialsDetailsItemProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [sshService] = useSSHService(vm);
  const { command, user } = useSSHCommand(vm, sshService);
  const vmiReady = isVMIReady(vmi);
  const sshServiceRunning = !!sshService;

  const content = vmiReady ? (
    <>
      <div
        className="topology-vm-details-panel__user-credentials"
        data-test="details-item-user-credentials-user-name"
      >
        {t('user: {{user}}', { user })}
      </div>
      <ClipboardCopy
        className="topology-vm-details-panel__user-credentials"
        data-test="SSHDetailsPage-command"
        isReadOnly
      >
        {sshServiceRunning ? command : `ssh ${user}@`}
      </ClipboardCopy>
      {!sshServiceRunning && (
        <span className="kubevirt-menu-actions__secondary-title">{t('Requires SSH service')}</span>
      )}
    </>
  ) : (
    <div className="text-secondary">{t('Virtual machine not running')}</div>
  );

  return (
    <VirtualMachineDescriptionItem
      className="topology-vm-details-panel__item"
      descriptionData={content}
      descriptionHeader={<span id="user-credentials">{t('User credentials')}</span>}
    />
  );
};

export default VMUserCredentialsDetailsItem;
