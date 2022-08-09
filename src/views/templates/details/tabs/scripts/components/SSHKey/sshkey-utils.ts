import produce from 'immer';

import { SecretModel, TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { addSecretToVM } from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

export const getTemplateSSHKeySecret = (
  template: V1Template,
  vmSSHKeySecretName: string,
): IoK8sApiCoreV1Secret | undefined =>
  template?.objects?.find((object) => object?.metadata?.name === vmSSHKeySecretName);

export const generateSSHKeySecret = (secretName: string, namespace: string, sshKey: string) => ({
  kind: SecretModel.kind,
  apiVersion: SecretModel.apiVersion,
  metadata: {
    name: secretName,
    namespace: namespace,
  },
  data: { key: btoa(sshKey) },
});

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
) => {
  const sshKeySecretObject = getTemplateSSHKeySecret(template, existingSecretName);

  if (sshKeySecretObject) {
    sshKeySecretObject.data.key = sshKey;
  } else {
    const vm = getTemplateVirtualMachineObject(template);

    const sshSecretName = `${vm?.metadata?.name}-sshkey-${getRandomChars()}`;

    updateSecretName(template, sshSecretName);

    template.objects.push(generateSSHKeySecret(sshSecretName, vm?.metadata?.namespace, sshKey));
  }
};

export const removeSecretObject = (template: V1Template, secretName: string) => {
  template.objects = (template?.objects || []).filter(
    (object) => object?.metadata?.name !== secretName,
  );
};

export const removeCredential = (template: V1Template, secretName: string) => {
  const vm = getTemplateVirtualMachineObject(template);

  vm.spec.template.spec.accessCredentials = vm.spec.template.spec.accessCredentials?.filter(
    (credential) => credential?.sshPublicKey?.source?.secret?.secretName !== secretName,
  );
};

export const changeSSHKeySecret = async (
  template: V1Template,
  externalSSHSecretName: string,
  sshkey: string,
  oldSecretName: string,
) => {
  if (isEmpty(sshkey) && isEmpty(externalSSHSecretName) && isEmpty(oldSecretName))
    return Promise.resolve();

  if (!isEmpty(externalSSHSecretName) && externalSSHSecretName === oldSecretName)
    return Promise.resolve();

  const newTemplate = produce(template, (draftTemplate) => {
    if (isEmpty(sshkey)) {
      removeSecretObject(draftTemplate, oldSecretName);
    }

    if (isEmpty(sshkey) && isEmpty(externalSSHSecretName) && oldSecretName) {
      removeCredential(draftTemplate, oldSecretName);
      return;
    }

    if (externalSSHSecretName) {
      updateSecretName(draftTemplate, externalSSHSecretName);
    }

    if (sshkey) {
      updateSSHKeyObject(draftTemplate, sshkey, oldSecretName);
    }
  });

  return k8sUpdate({
    model: TemplateModel,
    data: newTemplate,
    ns: newTemplate?.metadata?.namespace,
    name: newTemplate?.metadata?.name,
  });
};
