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
              'Only RHEL 9 supports dynamic SSH key injection. Instead, you must add an public SSH key before the VirtualMachine boots for the first time.',
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
