import { useCallback, useMemo, useState } from 'react';

import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import {
  removeSSHKeyObject,
  updateSSHKeyObject,
} from '@catalog/wizard/tabs/scripts/components/sshkey-utils';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import {
  addSecretToVM,
  removeSecretFromVM,
} from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { SecretModel } from '@kubevirt-utils/models';
import { getInitialSSHDetails } from '@kubevirt-utils/resources/secret/utils';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

type UseTemplateWizardSecrets = () => {
  onSubmit: (details: SSHSecretDetails) => Promise<void>;
  sshDetails: SSHSecretDetails;
  vm: V1VirtualMachine;
  vmAttachedSecretName: string;
};

const useTemplateWizardSecrets: UseTemplateWizardSecrets = () => {
  const { tabsData, updateTabsData, updateVM, vm } = useWizardVMContext();
  const { applyKeyToProject } = tabsData?.sshDetails;

  const vmAttachedSecretName = useMemo(() => getVMSSHSecretName(vm), [vm]);

  const [sshDetails, setSSHDetails] = useState<SSHSecretDetails>(
    getInitialSSHDetails({
      applyKeyToProject: applyKeyToProject,
      secretToCreate: tabsData.additionalObjects?.find((obj) => obj?.kind === SecretModel.kind),
      sshSecretName: vmAttachedSecretName,
    }),
  );

  const onSubmit = useCallback(
    async (details: SSHSecretDetails) => {
      const { secretOption, sshPubKey, sshSecretName } = details;

      if (isEqualObject(details, sshDetails)) {
        return;
      }

      removeSSHKeyObject(updateTabsData, sshDetails.sshSecretName);
      updateTabsData((currentTabsData) => {
        currentTabsData.sshDetails = sshDetails;
      });

      if (
        secretOption === SecretSelectionOption.none &&
        sshDetails.secretOption !== SecretSelectionOption.none
      ) {
        await updateVM(removeSecretFromVM(vm));
      }

      if (
        secretOption === SecretSelectionOption.useExisting &&
        sshDetails.sshSecretName !== sshSecretName &&
        !isEmpty(sshSecretName)
      ) {
        await updateVM(addSecretToVM(vm, sshSecretName));
      }

      if (
        secretOption === SecretSelectionOption.addNew &&
        !isEmpty(sshPubKey) &&
        !isEmpty(sshSecretName)
      ) {
        updateSSHKeyObject(vm, updateTabsData, sshPubKey, sshSecretName);
        await updateVM(addSecretToVM(vm, sshSecretName));
      }

      setSSHDetails(details);
      return Promise.resolve();
    },
    [sshDetails, updateTabsData, updateVM, vm],
  );

  return {
    onSubmit,
    sshDetails,
    vm,
    vmAttachedSecretName,
  };
};

export default useTemplateWizardSecrets;
