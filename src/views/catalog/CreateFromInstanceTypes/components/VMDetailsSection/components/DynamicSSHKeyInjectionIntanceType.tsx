import React from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeActionType } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { DynamicSSHKeyInjection } from '@kubevirt-utils/components/DynamicSSHKeyInjection/DynamicSSHKeyInjection';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PopoverPosition } from '@patternfly/react-core';

const DynamicSSHKeyInjectionIntanceType = () => {
  const { instanceTypeVMState, setInstanceTypeVMState } = useInstanceTypeVMStore();
  const { sshSecretCredentials } = instanceTypeVMState;

  return (
    <VirtualMachineDescriptionItem
      descriptionData={
        <DynamicSSHKeyInjection
          onSubmit={(checked: boolean) => {
            setInstanceTypeVMState({
              payload: checked,
              type: instanceTypeActionType.setIsDynamicSSHInjection,
            });
          }}
          isDisabled={!sshSecretCredentials?.sshSecretName}
        />
      }
      label={
        <HelpTextIcon
          bodyContent={t(
            'If set, SSH keys can be modified while the VM is running. If not set, the setting will depend on what is set during the first boot',
          )}
          position={PopoverPosition.right}
        />
      }
      descriptionHeader={t('Dynamic SSH key injection')}
    />
  );
};
export default DynamicSSHKeyInjectionIntanceType;
