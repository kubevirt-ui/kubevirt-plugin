import produce from 'immer';

import { type IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type V1SSHPublicKeyAccessCredentialPropagationMethod,
  type V1VirtualMachine,
  type V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  convertYAMLUserDataObject,
  getCloudInitData,
  getCloudInitVolume,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { MAX_NAME_LENGTH } from '@kubevirt-utils/components/SSHSecretModal/utils/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type WatchK8sResults } from '@openshift-console/dynamic-plugin-sdk';

import { getCloudInitConfigDrive } from './sshSecretHelpers';

export * from './sshSecretHelpers';

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
): boolean => Object.values(secretsData)?.every((data) => data.loaded);

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

export const addSecretToVM = (
  vm: V1VirtualMachine,
  secretName?: string,
  isDynamic?: boolean,
): V1VirtualMachine => {
  if (isWindows(vm?.spec?.template) || isEmpty(getCloudInitVolume(vm))) return vm;

  return produce(vm, (vmDraft) => {
    vmDraft.spec.template.spec.volumes = applyCloudDriveCloudInitVolume(vm, isDynamic);
    vmDraft.spec.template.spec.accessCredentials = [
      {
        sshPublicKey: {
          propagationMethod: getCloudInitPropagationMethod(isDynamic, vm),
          source: {
            secret: {
              secretName: secretName?.toString() ?? `${getName(vm)}-ssh-key`,
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
