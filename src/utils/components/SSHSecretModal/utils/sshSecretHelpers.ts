import { type IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1SSHPublicKeyAccessCredentialPropagationMethod } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { decodeSecret } from '@kubevirt-utils/resources/secret/utils';
import { generatePrettyName, validateSSHPublicKey } from '@kubevirt-utils/utils/utils';

import { MIN_NAME_LENGTH_FOR_GENERATED_SUFFIX } from './constants';

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
