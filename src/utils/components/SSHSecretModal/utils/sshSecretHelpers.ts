import produce from 'immer';

import { type IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type V1CloudInitConfigDriveSource,
  type V1CloudInitNoCloudSource,
  type V1SSHPublicKeyAccessCredentialPropagationMethod,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  convertUserDataObjectToYAML,
  convertYAMLUserDataObject,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { decodeSecret } from '@kubevirt-utils/resources/secret/utils';
import { getAccessCredentials } from '@kubevirt-utils/resources/vm';
import { generatePrettyName, isEmpty, validateSSHPublicKey } from '@kubevirt-utils/utils/utils';

import { DYNAMIC_SSH_INJECTION_CMD, MIN_NAME_LENGTH_FOR_GENERATED_SUFFIX } from './constants';

export const getAllSecretsFromSecretData = (
  secretsResourceData: IoK8sApiCoreV1Secret[],
): IoK8sApiCoreV1Secret[] => {
  const sshKeySecrets = secretsResourceData
    ?.filter((secret) => secret?.data?.key && validateSSHPublicKey(decodeSecret(secret)))
    ?.sort((a, b) => (a?.metadata?.name ?? '').localeCompare(b?.metadata?.name ?? ''));

  return sshKeySecrets;
};

export const getMappedProjectsWithKeys = (
  secretsData: IoK8sApiCoreV1Secret[],
): { [namespace: string]: IoK8sApiCoreV1Secret[] } => {
  const sshKeySecrets = getAllSecretsFromSecretData(secretsData);

  const sshData = sshKeySecrets.reduce(
    (acc, secret) => {
      const ns = secret?.metadata?.namespace ?? '';
      acc[ns] = [...(acc[ns] ?? []), secret];
      return acc;
    },
    {} as { [namespace: string]: IoK8sApiCoreV1Secret[] },
  );

  return sshData;
};

export const getPropagationMethod = (
  vm: V1VirtualMachine,
): undefined | V1SSHPublicKeyAccessCredentialPropagationMethod =>
  vm?.spec?.template?.spec?.accessCredentials?.[0]?.sshPublicKey?.propagationMethod;

export const generateValidSecretName = (secretName: string): string =>
  secretName.length > MIN_NAME_LENGTH_FOR_GENERATED_SUFFIX
    ? generatePrettyName()
    : generatePrettyName(secretName);

export const addNewSecret = (
  namespace: string,
  targetProject: string,
  activeNamespace: string,
): boolean => (namespace ? targetProject !== namespace : targetProject !== activeNamespace);

export const cmdIsSSHInjection = (cmd: string | string[]): boolean => {
  const extendedCommand = Array.isArray(cmd) ? cmd?.join(' ') : cmd;
  return extendedCommand?.includes(DYNAMIC_SSH_INJECTION_CMD);
};

export const getCloudInitConfigDrive = (
  isDynamic: boolean,
  cloudInitVolumeData: V1CloudInitConfigDriveSource | V1CloudInitNoCloudSource,
): V1CloudInitConfigDriveSource => {
  const userData = convertYAMLUserDataObject(cloudInitVolumeData?.userData);

  userData.runcmd ??= [];

  if (isDynamic && !userData.runcmd.some(cmdIsSSHInjection))
    userData.runcmd.push(DYNAMIC_SSH_INJECTION_CMD);

  if (!isDynamic) userData.runcmd = userData.runcmd.filter((cmd) => !cmdIsSSHInjection(cmd));

  return {
    ...cloudInitVolumeData,
    userData: convertUserDataObjectToYAML(userData, true),
  };
};

export const removeSecretFromVM = (vm: V1VirtualMachine, secretName?: string): V1VirtualMachine => {
  if (isEmpty(secretName)) {
    return vm;
  }

  return produce(vm, (vmDraft) => {
    const accessCredentials = getAccessCredentials(vmDraft);

    if (isEmpty(accessCredentials)) {
      return;
    }

    const filteredAccessCredentials = accessCredentials.filter(
      (credential) => credential?.sshPublicKey?.source?.secret?.secretName !== secretName,
    );

    if (filteredAccessCredentials.length === accessCredentials.length) {
      return;
    }

    if (filteredAccessCredentials.length > 0) {
      vmDraft.spec.template.spec.accessCredentials = filteredAccessCredentials;
      return;
    }

    delete vmDraft.spec.template.spec.accessCredentials;
  });
};
