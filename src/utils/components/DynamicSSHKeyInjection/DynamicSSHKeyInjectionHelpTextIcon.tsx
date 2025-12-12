import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import LightspeedSimplePopoverContent from '@lightspeed/components/LightspeedSimplePopoverContent';
import { OLSPromptType } from '@lightspeed/utils/prompts';
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
      bodyContent={(hide) => (
        <LightspeedSimplePopoverContent
          content={
            isDisabled
              ? t(
                  'Before you boot the VirtualMachine (VM) for the first time, add a public SSH key. Only RHEL 9+ versions support dynamic key injection, and you must enable dynamic SSH when you create the VM.',
                )
              : t(
                  'Requires RHEL versions 9+. If enabled, SSH keys can be changed while the VirtualMachine is running. Otherwise, the VirtualMachine inherits the key injection setting of its image.',
                )
          }
          hide={hide}
          promptType={OLSPromptType.DYNAMIC_SSH_KEY_INJECTION}
        />
      )}
      className="dynamic-ssh-key-help-text-icon"
      position={PopoverPosition.right}
    />
  );
};

export default DynamicSSHKeyInjectionHelpTextIcon;
