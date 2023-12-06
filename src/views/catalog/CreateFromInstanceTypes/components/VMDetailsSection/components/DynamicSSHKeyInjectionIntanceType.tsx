import React from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeActionType } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { DYNAMIC_CREDENTIALS_SUPPORT } from '@kubevirt-utils/components/DynamicSSHKeyInjection/constants/constants';
import { DynamicSSHKeyInjection } from '@kubevirt-utils/components/DynamicSSHKeyInjection/DynamicSSHKeyInjection';
import DynamicSSHKeyInjectionHelpTextIcon from '@kubevirt-utils/components/DynamicSSHKeyInjection/DynamicSSHKeyInjectionHelpTextIcon';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const DynamicSSHKeyInjectionIntanceType = () => {
  const { instanceTypeVMState, setInstanceTypeVMState } = useInstanceTypeVMStore();
  const { sshSecretCredentials } = instanceTypeVMState;
  const hasDynamicSSHLabel =
    instanceTypeVMState?.pvcSource?.metadata?.labels?.[DYNAMIC_CREDENTIALS_SUPPORT];
  const isDisabled = !sshSecretCredentials?.sshSecretName || !hasDynamicSSHLabel;

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
          isDisabled={isDisabled}
        />
      }
      descriptionHeader={<>{t('Dynamic SSH key injection')}</>}
      label={<DynamicSSHKeyInjectionHelpTextIcon isDisabled={isDisabled} />}
    />
  );
};
export default DynamicSSHKeyInjectionIntanceType;
