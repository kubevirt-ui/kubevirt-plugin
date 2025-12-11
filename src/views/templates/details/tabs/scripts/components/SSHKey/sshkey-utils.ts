import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui/kubevirt-api/console';
import { addSecretToVM } from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getAccessCredentials } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export const updateAccessCredential = (template: V1Template, secretName: string) => {
  const vm = getTemplateVirtualMachineObject(template);

  template.objects = (template?.objects || []).map((object) =>
    object.kind !== VirtualMachineModel.kind ? object : addSecretToVM(vm, secretName),
  );
};

export const removeAccessCredential = (template: V1Template, secretName: string) => {
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
