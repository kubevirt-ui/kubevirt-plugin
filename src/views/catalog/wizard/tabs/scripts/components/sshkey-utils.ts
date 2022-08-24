import { produceVMSSHKey, WizardVMContextType } from '@catalog/utils/WizardVMContext';
import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getRandomChars } from '@kubevirt-utils/utils/utils';

export const generateSSHKeySecret = (secretName: string, namespace: string, sshKey: string) => ({
  kind: SecretModel.kind,
  apiVersion: SecretModel.apiVersion,
  metadata: {
    name: secretName,
    namespace: namespace,
  },
  data: { key: btoa(sshKey) },
});

export const removeSSHKeyObject = (
  updateTabsData: WizardVMContextType['updateTabsData'],
  oldSSHServiceName: string,
) =>
  updateTabsData((tabsDraft) => {
    tabsDraft.additionalObjects = (tabsDraft?.additionalObjects || []).filter(
      (object) =>
        !(object?.kind === SecretModel.kind && object?.metadata?.name === oldSSHServiceName),
    );
  });

export const changeSecretKey = (
  updateTabsData: WizardVMContextType['updateTabsData'],
  sshkey: string,
  oldSSHServiceName: string,
) =>
  updateTabsData((draftTabs) => {
    const secretObject = draftTabs?.additionalObjects?.find(
      (object) => object?.kind === SecretModel.kind && object?.metadata?.name === oldSSHServiceName,
    ) as IoK8sApiCoreV1Secret;

    secretObject.data.key = btoa(sshkey);
  });

export const updateSSHKeyObject = (
  vm: V1VirtualMachine,
  updateVM: WizardVMContextType['updateVM'],
  updateTabsData: WizardVMContextType['updateTabsData'],
  sshkey: string,
) => {
  const sshSecretName = `${vm.metadata.name}-ssh-key-${getRandomChars()}`;

  updateTabsData((draftTabs) => {
    if (!draftTabs.additionalObjects) draftTabs.additionalObjects = [];

    draftTabs.additionalObjects.push(
      generateSSHKeySecret(sshSecretName, vm?.metadata?.namespace, sshkey),
    );
  });

  return updateVM((vmDraft) => {
    const produced = produceVMSSHKey(vmDraft, sshSecretName);
    vmDraft.spec = produced.spec;
  });
};
