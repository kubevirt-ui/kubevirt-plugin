import produce from 'immer';

import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  V1CloudInitConfigDriveSource,
  V1CloudInitNoCloudSource,
  V1SSHPublicKeyAccessCredentialPropagationMethod,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  convertYAMLUserDataObject,
  getCloudInitData,
  getCloudInitVolume,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH_FOR_GENERATED_SUFFIX,
} from '@kubevirt-utils/components/SSHSecretModal/utils/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { decodeSecret, encodeSecretKey } from '@kubevirt-utils/resources/secret/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { generatePrettyName, isEmpty, validateSSHPublicKey } from '@kubevirt-utils/utils/utils';
import {
  k8sCreate,
  K8sResourceCommon,
  k8sUpdate,
  WatchK8sResults,
} from '@openshift-console/dynamic-plugin-sdk';

export const getAllSecrets = (
  secretsData: WatchK8sResults<{ [p: string]: IoK8sApiCoreV1Secret[] }>,
): IoK8sApiCoreV1Secret[] => {
  const secretsArrays = Object.values(secretsData)?.map((watchedResource) => watchedResource?.data);
  return secretsArrays?.reduce((acc, secretsArray) => {
    return [...acc, ...secretsArray];
  }, []);
};

export const getSecretsLoaded = (
  secretsData: WatchK8sResults<{ [p: string]: IoK8sApiCoreV1Secret[] }>,
) => Object.values(secretsData)?.every((data) => data.loaded);

export const validateSecretNameLength = (secretName: string): boolean =>
  secretName.length <= MAX_NAME_LENGTH;

export const validateSecretNameUnique = (
  secretName: string,
  vmNamespaceTarget: string,
  secrets: IoK8sApiCoreV1Secret[],
): boolean =>
  isEmpty(
    secrets?.find(
      (secret) => getName(secret) === secretName && getNamespace(secret) === vmNamespaceTarget,
    ),
  );

export const getSecretNameErrorMessage = (
  secretName: string,
  vmNamespaceTarget: string,
  secrets: IoK8sApiCoreV1Secret[],
): string => {
  if (!validateSecretNameUnique(secretName, vmNamespaceTarget, secrets))
    return t('Secret name must be unique in this namespace.');

  if (!validateSecretNameLength(secretName))
    return t('Secret name too long, maximum of 253 characters.');

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

export const applyCloudDriveCloudInitVolume = (
  vm: V1VirtualMachine,
  isDynamic?: boolean,
): V1Volume[] => {
  const cloudInitVolume = getCloudInitVolume(vm);

  if (isEmpty(cloudInitVolume)) return getVolumes(vm);

  const cloudDriveVolume: V1Volume = {
    cloudInitNoCloud: getCloudInitConfigDrive(isDynamic, getCloudInitData(cloudInitVolume)),
    name: cloudInitVolume.name,
  };

  return getVolumes(vm).map((vol) => (vol.name === cloudDriveVolume.name ? cloudDriveVolume : vol));
};

export const addSecretToVM = (vm: V1VirtualMachine, secretName?: string, isDynamic?: boolean) => {
  if (isWindows(vm?.spec?.template)) return vm;

  return produce(vm, (vmDraft) => {
    vmDraft.spec.template.spec.volumes = applyCloudDriveCloudInitVolume(vm, isDynamic);
    vmDraft.spec.template.spec.accessCredentials = [
      {
        sshPublicKey: {
          propagationMethod: getCloudInitPropagationMethod(isDynamic, vm),
          source: {
            secret: {
              secretName: secretName?.toString() || `${getName(vm)}-ssh-key`,
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
    : ({ noCloud: {} } as V1SSHPublicKeyAccessCredentialPropagationMethod);
};
export const getCloudInitConfigDrive = (
  isDynamic: boolean,
  cloudInitVolumeData: V1CloudInitConfigDriveSource | V1CloudInitNoCloudSource,
  isTemplate = false,
): V1CloudInitConfigDriveSource => {
  const runCmd = `${
    isTemplate ? '\n' : ''
  }runcmd:\n- [ setsebool, -P, virt_qemu_ga_manage_ssh, on ]`;
  const userData = cloudInitVolumeData?.userData?.concat(runCmd);
  const userDataClean = cloudInitVolumeData?.userData?.replace(runCmd, '');

  return isDynamic
    ? {
        ...cloudInitVolumeData,
        userData,
      }
    : { ...cloudInitVolumeData, userData: userDataClean };
};

export const createSSHSecret = (
  sshKey: string,
  secretName: string,
  secretNamespace: string,
  dryRun = false,
) =>
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
    ...(dryRun && { queryParams: { dryRun: 'All' } }),
  });

export const getAllSecretsFromSecretData = (secretsResourceData: IoK8sApiCoreV1Secret[]) => {
  const sshKeySecrets = secretsResourceData
    ?.filter((secret) => secret?.data?.key && validateSSHPublicKey(decodeSecret(secret)))
    ?.sort((a, b) => a?.metadata?.name.localeCompare(b?.metadata?.name));

  return sshKeySecrets;
};

export const getMappedProjectsWithKeys = (
  secretsData: IoK8sApiCoreV1Secret[],
): { [namespace: string]: IoK8sApiCoreV1Secret[] } => {
  const sshKeySecrets = getAllSecretsFromSecretData(secretsData);

  const sshData = sshKeySecrets.reduce((acc, secret) => {
    acc[secret?.metadata?.namespace] = [...(acc?.[secret?.metadata?.namespace] || []), secret];
    return acc;
  }, {} as { [namespace: string]: IoK8sApiCoreV1Secret[] });

  return sshData;
};

export const getPropagationMethod = (
  vm: V1VirtualMachine,
): V1SSHPublicKeyAccessCredentialPropagationMethod =>
  vm?.spec?.template?.spec?.accessCredentials?.[0].sshPublicKey.propagationMethod;

export const generateValidSecretName = (secretName: string) =>
  secretName.length > MIN_NAME_LENGTH_FOR_GENERATED_SUFFIX
    ? generatePrettyName()
    : generatePrettyName(secretName);

export const addNewSecret = (
  namespace: string,
  targetProject: string,
  activeNamespace: string,
): boolean => (namespace ? targetProject !== namespace : targetProject !== activeNamespace);
