import React from 'react';

import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import { DYNAMIC_CREDENTIALS_SUPPORT } from '@kubevirt-utils/components/DynamicSSHKeyInjection/constants/constants';
import { DynamicSSHKeyInjection } from '@kubevirt-utils/components/DynamicSSHKeyInjection/DynamicSSHKeyInjection';
import DynamicSSHKeyInjectionHelpTextIcon from '@kubevirt-utils/components/DynamicSSHKeyInjection/DynamicSSHKeyInjectionHelpTextIcon';
import {
  getCloudInitConfigDrive,
  getCloudInitPropagationMethod,
} from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAccessCredentials, getVMSSHSecretName, getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

const DynamicSSHKeyInjectionWizard = () => {
  const { updateVM, vm } = useWizardVMContext();
  const hasSSHKey = !isEmpty(getAccessCredentials(vm));
  const secretName = getVMSSHSecretName(vm);
  const hasDynamicSSHLabel = vm?.metadata?.labels?.[DYNAMIC_CREDENTIALS_SUPPORT];
  const isDisabled = (!hasSSHKey && !secretName) || !hasDynamicSSHLabel;

  const onSubmit = (checked: boolean) => {
    updateVM((vmDraft) => {
      const cloudInitConfigDrive = getVolumes(vm)?.find((v) => v.cloudInitConfigDrive);

      if (cloudInitConfigDrive) {
        vmDraft.spec.template.spec.volumes = [
          ...getVolumes(vm).filter((v) => !v.cloudInitConfigDrive),
          {
            cloudInitConfigDrive: getCloudInitConfigDrive(
              checked,
              cloudInitConfigDrive.cloudInitConfigDrive,
            ),
            name: cloudInitConfigDrive.name,
          },
        ];
      }
      vmDraft.spec.template.spec.accessCredentials[0].sshPublicKey.propagationMethod =
        getCloudInitPropagationMethod(checked, vm);
    });
  };

  return (
    <WizardDescriptionItem
      description={<DynamicSSHKeyInjection isDisabled={isDisabled} onSubmit={onSubmit} vm={vm} />}
      helpTextIcon={<DynamicSSHKeyInjectionHelpTextIcon isDisabled={isDisabled} />}
      testId="wizard-dynamic-ssh-key-injection"
      title={t('Dynamic SSH key injection')}
    />
  );
};

export default DynamicSSHKeyInjectionWizard;
