import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { addSecretToVM } from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { generateSSHKeySecret } from '@kubevirt-utils/resources/secret/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getAccessCredentials } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export const getTemplateSSHKeySecret = (
  template: V1Template,
  vmSSHKeySecretName: string,
): IoK8sApiCoreV1Secret | undefined =>
  template?.objects?.find((object) => getName(object) === vmSSHKeySecretName);

export const updateSecretName = (template: V1Template, secretName: string) => {
  const vm = getTemplateVirtualMachineObject(template);

  template.objects = (template?.objects || []).map((object) =>
    object.kind !== VirtualMachineModel.kind ? object : addSecretToVM(vm, secretName),
  );
};

export const updateSSHKeyObject = (
  template: V1Template,
  sshKey: string,
  existingSecretName: string,
  newSSHSecretName: string,
) => {
  const sshKeySecretObject = getTemplateSSHKeySecret(template, existingSecretName);

  if (sshKeySecretObject) {
    sshKeySecretObject.data.key = sshKey;
  } else {
    const vm = getTemplateVirtualMachineObject(template);

    updateSecretName(template, newSSHSecretName);

    template.objects.push(generateSSHKeySecret(newSSHSecretName, getNamespace(vm), sshKey));
  }
};

export const removeSecretObject = (template: V1Template, secretName: string) => {
  template.objects = (template?.objects || []).filter((object) => getName(object) !== secretName);
};

export const removeCredential = (template: V1Template, secretName: string) => {
  const vm = getTemplateVirtualMachineObject(template);
  const accessCredentials = getAccessCredentials(vm);

  if (isEmpty(accessCredentials)) return;

  const filteredAccessCredentials = accessCredentials.filter(
    (credential) => credential?.sshPublicKey?.source?.secret?.secretName !== secretName,
  );

  if (filteredAccessCredentials.length > 0) {
    vm.spec.template.spec.accessCredentials = filteredAccessCredentials;
    return;
  }

  delete vm.spec.template.spec.accessCredentials;
};
