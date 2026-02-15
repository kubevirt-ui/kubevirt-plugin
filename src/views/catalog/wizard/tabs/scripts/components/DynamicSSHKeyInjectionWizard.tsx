import React from 'react';

import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import {
  getCloudInitData,
  getCloudInitVolume,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { DYNAMIC_CREDENTIALS_SUPPORT } from '@kubevirt-utils/components/DynamicSSHKeyInjection/constants/constants';
import { DynamicSSHKeyInjection } from '@kubevirt-utils/components/DynamicSSHKeyInjection/DynamicSSHKeyInjection';
import DynamicSSHKeyInjectionHelpTextIcon from '@kubevirt-utils/components/DynamicSSHKeyInjection/DynamicSSHKeyInjectionHelpTextIcon';
import {
  getCloudInitConfigDrive,
  getCloudInitPropagationMethod,
} from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { getAccessCredentials, getVMSSHSecretName, getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

const DynamicSSHKeyInjectionWizard = () => {
  const { t } = useKubevirtTranslation();
  const { updateVM, vm } = useWizardVMContext();
  const hasSSHKey = !isEmpty(getAccessCredentials(vm));
  const secretName = getVMSSHSecretName(vm);
  const hasDynamicSSHLabel = getLabel(vm, DYNAMIC_CREDENTIALS_SUPPORT) === 'true';
  const isDisabled = (!hasSSHKey && !secretName) || !hasDynamicSSHLabel;

  const onSubmit = (checked: boolean) => {
    updateVM((vmDraft) => {
      const cloudInitVolume = getCloudInitVolume(vm);

      if (cloudInitVolume) {
        vmDraft.spec.template.spec.volumes = [
          ...getVolumes(vm).filter((volume) => !getCloudInitData(volume)),
          {
            cloudInitNoCloud: getCloudInitConfigDrive(checked, getCloudInitData(cloudInitVolume)),
            name: cloudInitVolume.name,
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
