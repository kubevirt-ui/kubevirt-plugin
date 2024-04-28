import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ClipboardCopy } from '@patternfly/react-core';

import { getConsoleVirtctlCommand } from '../utils';

type VirtctlSSHCommandClipboardCopyProps = {
  vm: V1VirtualMachine;
};

const VirtctlSSHCommandClipboardCopy: FC<VirtctlSSHCommandClipboardCopyProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const sshSecretNotConfigured = isEmpty(getVMSSHSecretName(vm));

  if (sshSecretNotConfigured) {
    return <div className="pf-u-font-size-xs">{t('SSH secret not configured')}</div>;
  }

  return (
    <ClipboardCopy
      clickTip={t('Copied')}
      data-test="ssh-over-virtctl"
      hoverTip={t('Copy to clipboard')}
    >
      {getConsoleVirtctlCommand(vm)}
    </ClipboardCopy>
  );
};

export default VirtctlSSHCommandClipboardCopy;
