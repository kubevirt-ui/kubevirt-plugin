import produce from 'immer';

import { VirtualMachineModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  V1CloudInitConfigDriveSource,
  V1CloudInitNoCloudSource,
  V1SSHPublicKeyAccessCredentialPropagationMethod,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  convertUserDataObjectToYAML,
  convertYAMLUserDataObject,
  getCloudInitData,
  getCloudInitVolume,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import {
  DYNAMIC_SSH_INJECTION_CMD,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH_FOR_GENERATED_SUFFIX,
} from '@kubevirt-utils/components/SSHSecretModal/utils/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { decodeSecret } from '@kubevirt-utils/resources/secret/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { generatePrettyName, isEmpty, validateSSHPublicKey } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';
import { WatchK8sResults } from '@openshift-console/dynamic-plugin-sdk';

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

export const validateSecretNameNoDots = (secretName: string): boolean => !secretName.includes('.');

export const validateSecretName = (secretName: string): boolean =>
  validateSecretNameNoDots(secretName) && validateSecretNameLength(secretName);

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

  if (!validateSecretNameNoDots(secretName)) return t('Secret name must not contain periods');

  return null;
};

export const removeSecretFromVM = (vm: V1VirtualMachine) =>
  produce(vm, (vmDraft) => {
    delete vmDraft.spec.template.spec.accessCredentials;
  });

export const detachVMSecret = async (vm: V1VirtualMachine) => {
  await kubevirtK8sUpdate({
    cluster: getCluster(vm),
    data: removeSecretFromVM(vm),
    model: VirtualMachineModel,
  });
};

export const applyCloudDriveCloudInitVolume = (
  vm: V1VirtualMachine,
  isDynamic?: boolean | undefined,
): V1Volume[] => {
  const cloudInitVolume = getCloudInitVolume(vm);

  if (isEmpty(cloudInitVolume)) return getVolumes(vm);

  const cloudDriveVolume: V1Volume = {
    cloudInitNoCloud:
      isDynamic === undefined
        ? getCloudInitData(cloudInitVolume)
        : getCloudInitConfigDrive(isDynamic, getCloudInitData(cloudInitVolume)),
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

export const cmdIsSSHInjection = (cmd: string | string[]) => {
  const extendedCommand = Array.isArray(cmd) ? cmd?.join(' ') : cmd;
  return extendedCommand?.includes(DYNAMIC_SSH_INJECTION_CMD);
};

export const getCloudInitConfigDrive = (
  isDynamic: boolean,
  cloudInitVolumeData: V1CloudInitConfigDriveSource | V1CloudInitNoCloudSource,
): V1CloudInitConfigDriveSource => {
  const userData = convertYAMLUserDataObject(cloudInitVolumeData?.userData);

  userData.runcmd ??= [];

  if (isDynamic && !userData.runcmd.find(cmdIsSSHInjection))
    userData.runcmd.push(DYNAMIC_SSH_INJECTION_CMD);

  if (!isDynamic) userData.runcmd = userData.runcmd.filter((cmd) => !cmdIsSSHInjection(cmd));

  return {
    ...cloudInitVolumeData,
    userData: convertUserDataObjectToYAML(userData, true),
  };
};

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
