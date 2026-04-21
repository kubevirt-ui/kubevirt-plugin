import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ClipboardCopy } from '@patternfly/react-core';

import { getConsoleVirtctlCommand } from '../utils';

type VirtctlSSHCommandClipboardCopyProps = {
  isNamespaceManagedByUDN: boolean;
  vm: V1VirtualMachine;
};

const VirtctlSSHCommandClipboardCopy: FC<VirtctlSSHCommandClipboardCopyProps> = ({
  isNamespaceManagedByUDN,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  const sshSecretNotConfigured = isEmpty(getVMSSHSecretName(vm));

  if (sshSecretNotConfigured) {
    return (
      <div className="pf-v6-u-font-size-xs">
        {isNamespaceManagedByUDN
          ? t('Not supported with primary user-defined networks')
          : t('SSH secret not configured')}
      </div>
    );
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
