import React from 'react';

import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import { DynamicSSHKeyInjection } from '@kubevirt-utils/components/DynamicSSHKeyInjection/DynamicSSHKeyInjection';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import {
  getCloudInitConfigDrive,
  getCloudInitPropagationMethod,
} from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAccessCredentials, getVMSSHSecretName, getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PopoverPosition } from '@patternfly/react-core';

const DynamicSSHKeyInjectionWizard = () => {
  const { updateVM, vm } = useWizardVMContext();
  const hasSSHKey = !isEmpty(getAccessCredentials(vm));
  const secretName = getVMSSHSecretName(vm);

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
      description={
        <DynamicSSHKeyInjection
          isDisabled={!hasSSHKey && !secretName}
          onSubmit={onSubmit}
          vm={vm}
        />
      }
      helpTextIcon={
        <HelpTextIcon
          bodyContent={t(
            'If set, SSH keys can be modified while the VM is running. If not set, the setting will depend on what is set during the first boot',
          )}
          className="dynamic-ssh-key"
          position={PopoverPosition.right}
        />
      }
      testId="wizard-dynamic-ssh-key-injection"
      title={t('Dynamic SSH key injection')}
    />
  );
};

export default DynamicSSHKeyInjectionWizard;
