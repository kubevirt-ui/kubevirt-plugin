import { WizardVMContextType } from '@catalog/utils/WizardVMContext';
import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { generateSSHKeySecret } from '@kubevirt-utils/resources/secret/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

export const removeSSHKeyObject = (
  updateTabsData: WizardVMContextType['updateTabsData'],
  oldSSHServiceName: string,
) =>
  updateTabsData((tabsDraft) => {
    tabsDraft.additionalObjects = (tabsDraft?.additionalObjects || []).filter(
      (object) => !(object?.kind === SecretModel.kind && getName(object) === oldSSHServiceName),
    );
  });

export const updateSSHKeyObject = (
  vm: V1VirtualMachine,
  updateTabsData: WizardVMContextType['updateTabsData'],
  sshkey: string,
  secretName: string,
) => {
  updateTabsData((draftTabs) => {
    if (!draftTabs.additionalObjects) draftTabs.additionalObjects = [];

    draftTabs.additionalObjects.push(generateSSHKeySecret(secretName, getNamespace(vm), sshkey));
  });
};
