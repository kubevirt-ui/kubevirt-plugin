import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  addSecretToVM,
  createVmSSHSecret,
  removeSecretToVM,
} from '@kubevirt-utils/components/CloudInit/utils/cloudint-utils';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';

export const changeVMSecret = async (
  vm: V1VirtualMachine,
  vmOldSecret: IoK8sApiCoreV1Secret,
  newSSHKey: string,
): Promise<IoK8sApiCoreV1Secret> => {
  const sshSecretName = `${vm.metadata.name}-ssh-key-${getRandomChars()}`;
  if (
    (vmOldSecret || !newSSHKey) &&
    vmOldSecret?.metadata?.ownerReferences?.length === 0 &&
    vmOldSecret?.metadata?.ownerReferences?.[0]?.uid === vm.metadata.uid
  )
    await k8sDelete({
      model: SecretModel,
      resource: vmOldSecret,
    });

  if (newSSHKey) {
    addSecretToVM(vm, sshSecretName);

    return await createVmSSHSecret(vm, newSSHKey, sshSecretName);
  } else {
    removeSecretToVM(vm);
  }
};
