import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PopoverPosition } from '@patternfly/react-core';

import HelpTextIcon from '../HelpTextIcon/HelpTextIcon';

type DynamicSSHKeyInjectionHelpTextIconProps = {
  isDisabled: boolean;
};
const DynamicSSHKeyInjectionHelpTextIcon: FC<DynamicSSHKeyInjectionHelpTextIconProps> = (
  isDisabled,
) => {
  const { t } = useKubevirtTranslation();
  return (
    <HelpTextIcon
      bodyContent={
        isDisabled
          ? t(
              'Before you boot the VirtualMachine (VM) for the first time, add a public SSH key. Only RHEL 9 supports dynamic key injection, and in RHEL 9 you must enable dynamic SSH when you create the VM.',
            )
          : t(
              'Requires RHEL 9. If enabled, SSH keys can be changed while the VirtualMachine is running. Otherwise, the VirtualMachine inherits the key injection setting of its image.',
            )
      }
      className="dynamic-ssh-key-help-text-icon"
      position={PopoverPosition.right}
    />
  );
};

export default DynamicSSHKeyInjectionHelpTextIcon;
