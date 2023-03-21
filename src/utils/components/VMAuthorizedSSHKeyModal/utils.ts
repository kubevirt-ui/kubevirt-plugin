import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  addSecretToVM,
  createVmSSHSecret,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { k8sDelete, k8sPatch, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

const produceAndUpdate = (
  vm: V1VirtualMachine,
  producer: (vmDraft: WritableDraft<V1VirtualMachine>) => V1VirtualMachine,
) => {
  const produced = producer(vm);
  return k8sUpdate({
    model: VirtualMachineModel,
    data: produced,
    ns: produced?.metadata?.namespace,
    name: produced?.metadata?.name,
  });
};

export const decodeSecret = (secret: IoK8sApiCoreV1Secret): string =>
  secret?.data ? atob(secret?.data?.key || Object.values(secret?.data)?.[0] || '') : '';

export const changeVMSecret = async (
  vm: V1VirtualMachine,
  vmOldSecret: IoK8sApiCoreV1Secret,
  newSSHKey?: string,
): Promise<IoK8sApiCoreV1Secret> => {
  const sshSecretName = `${vm.metadata.name}-ssh-key-${getRandomChars()}`;
  if (
    (vmOldSecret || !newSSHKey) &&
    vmOldSecret?.metadata?.ownerReferences?.length === 1 &&
    vmOldSecret?.metadata?.ownerReferences?.[0]?.uid === vm.metadata.uid
  ) {
    await k8sDelete({
      model: SecretModel,
      resource: vmOldSecret,
    });
  }

  if (newSSHKey) {
    await produceAndUpdate(vm, (vmDraft) => {
      const produced = addSecretToVM(vm, sshSecretName);
      vmDraft.spec = produced.spec;

      return vmDraft;
    });

    return await createVmSSHSecret(vm, newSSHKey, sshSecretName);
  } else if (!!vm?.spec?.template?.spec?.accessCredentials) {
    await produceAndUpdate(vm, (vmDraft) => {
      delete vmDraft.spec.template.spec.accessCredentials;
      return vmDraft;
    });
  }
};

export const attachVMSecret = async (
  vm: V1VirtualMachine,
  vmOldSecret: IoK8sApiCoreV1Secret,
  newSSHSecret: IoK8sApiCoreV1Secret,
) => {
  if (vmOldSecret?.metadata?.name === newSSHSecret?.metadata?.name) return;

  await produceAndUpdate(vm, (vmDraft) => {
    const produced = addSecretToVM(vm, newSSHSecret?.metadata?.name);
    vmDraft.spec = produced.spec;

    return vmDraft;
  });
};

export const detachVMSecret = async (vm: V1VirtualMachine, vmSecret: IoK8sApiCoreV1Secret) => {
  await k8sPatch({
    model: VirtualMachineModel,
    resource: vm,
    data: [
      {
        op: 'remove',
        path: '/spec/template/spec/accessCredentials',
      },
    ],
  });

  const updatedSecret = produce(vmSecret, (draftSecret) => {
    if (draftSecret.metadata.ownerReferences)
      draftSecret.metadata.ownerReferences = draftSecret.metadata.ownerReferences.filter(
        (ref) => ref?.uid !== vm?.metadata?.uid,
      );
  });

  await k8sUpdate({
    model: SecretModel,
    data: updatedSecret,
  });
};
