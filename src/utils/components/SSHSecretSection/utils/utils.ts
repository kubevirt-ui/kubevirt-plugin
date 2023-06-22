import produce from 'immer';

import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  V1CloudInitConfigDriveSource,
  V1CloudInitNoCloudSource,
  V1SSHPublicKeyAccessCredentialPropagationMethod,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  convertYAMLUserDataObject,
  getCloudInitData,
  getCloudInitVolume,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { encodeSecretKey } from '@kubevirt-utils/resources/secret/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate, K8sResourceCommon, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

const validateSecretNameLength = (secretName: string): boolean => secretName.length <= 51;

const validateSecretNameUnique = (secretName: string, secrets: IoK8sApiCoreV1Secret[]): boolean =>
  isEmpty(secrets?.find((secret) => getName(secret) === secretName));

export const getSecretNameErrorMessage = (
  secretName: string,
  secrets: IoK8sApiCoreV1Secret[],
): string => {
  if (!validateSecretNameUnique(secretName, secrets))
    return t('Secret name must be unique in this namespace.');

  if (!validateSecretNameLength(secretName))
    return t('Secret name too long, maximum of 51 characters.');

  return null;
};

export const removeSecretToVM = (vm: V1VirtualMachine) =>
  produce(vm, (vmDraft) => {
    delete vmDraft.spec.template.spec.accessCredentials;
  });

export const detachVMSecret = async (vm: V1VirtualMachine) => {
  await k8sUpdate({
    data: removeSecretToVM(vm),
    model: VirtualMachineModel,
  });
};

export const addSecretToVM = (vm: V1VirtualMachine, secretName?: string, isDynamic?: boolean) => {
  return produce(vm, (vmDraft) => {
    const cloudInitNoCloudVolume = getVolumes(vm)?.find((v) => v.cloudInitNoCloud);

    if (cloudInitNoCloudVolume) {
      vmDraft.spec.template.spec.volumes = [
        ...getVolumes(vm).filter((v) => !v.cloudInitNoCloud),
        {
          cloudInitConfigDrive: getCloudInitConfigDrive(
            isDynamic,
            cloudInitNoCloudVolume.cloudInitNoCloud,
          ),

          name: cloudInitNoCloudVolume.name,
        },
      ];
    }
    vmDraft.spec.template.spec.accessCredentials = [
      {
        sshPublicKey: {
          propagationMethod: getCloudInitPropagationMethod(isDynamic, vm),
          source: {
            secret: {
              secretName: secretName || `${getName(vm)}-ssh-key`,
            },
          },
        },
      },
    ];
  });
};

export const getCloudInitPropagationMethod = (
  isDynamic: boolean,
  vm: V1VirtualMachine,
): V1SSHPublicKeyAccessCredentialPropagationMethod => {
  const cloudInitData = getCloudInitData(getCloudInitVolume(vm));
  const userData = convertYAMLUserDataObject(cloudInitData?.userData);
  return isDynamic
    ? {
        qemuGuestAgent: {
          users: [userData?.user],
        },
      }
    : { configDrive: {} };
};
export const getCloudInitConfigDrive = (
  isDynamic: boolean,
  cloudInitVolume: V1CloudInitConfigDriveSource | V1CloudInitNoCloudSource,
): V1CloudInitConfigDriveSource => {
  const runCmd = `\nruncmd:\n- [ setsebool, -P, virt_qemu_ga_manage_ssh, on ]`;
  const userData = cloudInitVolume?.userData?.concat(runCmd);
  const userDataClean = cloudInitVolume?.userData?.replace(runCmd, '');

  return isDynamic
    ? {
        ...cloudInitVolume,
        userData,
      }
    : { ...cloudInitVolume, userData: userDataClean };
};
export const createSSHSecret = (sshKey: string, secretName: string, secretNamespace: string) =>
  k8sCreate<K8sResourceCommon & { data?: { [key: string]: string } }>({
    data: {
      apiVersion: SecretModel.apiVersion,
      data: { key: encodeSecretKey(sshKey) },
      kind: SecretModel.kind,
      metadata: {
        name: secretName,
        namespace: secretNamespace,
      },
    },
    model: SecretModel,
  });
