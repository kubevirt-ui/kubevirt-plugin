import { Buffer } from 'buffer';

import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sDelete, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { getName } from '../shared';

import {
  getCloudInitData,
  getCloudInitVolume,
} from './../../components/CloudinitModal/utils/cloudinit-utils';

export const decodeSecret = (secret: IoK8sApiCoreV1Secret): string =>
  Buffer.from(secret?.data?.key || Object.values(secret?.data)?.[0] || '', 'base64').toString();

export const encodeSecretKey = (key: string) => Buffer.from(key).toString('base64');

export const encodeKeyForVirtctlCommand = (vm: V1VirtualMachine, decodedPubKey: string): string => {
  const sshKeys = `ssh_authorized_keys:
                     - ${decodedPubKey}`;

  const sshString = decodedPubKey ? sshKeys : '';

  const cloudInitUserData = getCloudInitData(getCloudInitVolume(vm))?.userData.concat(sshString);

  return encodeSecretKey(cloudInitUserData);
};

export const generateSSHKeySecret = (name: string, namespace: string, sshKey: string) => ({
  apiVersion: SecretModel.apiVersion,
  data: { key: encodeSecretKey(sshKey) },
  kind: SecretModel.kind,
  metadata: { name, namespace },
});

export const getInitialSSHDetails = ({
  applyKeyToProject = false,
  secretToCreate,
  sshSecretName,
  sshSecretNamespace = '',
}: {
  applyKeyToProject?: boolean;
  secretToCreate?: IoK8sApiCoreV1Secret;
  sshSecretName: string;
  sshSecretNamespace?: string;
}): SSHSecretDetails =>
  !isEmpty(secretToCreate)
    ? {
        appliedDefaultKey: false,
        applyKeyToProject,
        secretOption: SecretSelectionOption.addNew,
        sshPubKey: decodeSecret(secretToCreate),
        sshSecretName: getName(secretToCreate),
        sshSecretNamespace,
      }
    : {
        appliedDefaultKey: true,
        applyKeyToProject,
        secretOption: !isEmpty(sshSecretName)
          ? SecretSelectionOption.useExisting
          : SecretSelectionOption.none,
        sshPubKey: '',
        sshSecretName: sshSecretName || '',
        sshSecretNamespace,
      };

type CreateUserPasswordSecretType = (input: {
  namespace: string;
  password: string;
  secretName: string;
  username: string;
}) => Promise<IoK8sApiCoreV1Secret>;

export const createUserPasswordSecret: CreateUserPasswordSecretType = ({
  namespace,
  password,
  secretName,
  username,
}) =>
  k8sCreate({
    data: {
      apiVersion: 'v1',
      data: {
        accessKeyId: encodeSecretKey(username),
        secretKey: encodeSecretKey(password),
      },
      kind: 'Secret',
      metadata: {
        name: secretName,
        namespace,
      },
      type: 'Opaque',
    },
    model: SecretModel,
    ns: namespace,
  });

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

export const deleteSecret = (secret: IoK8sApiCoreV1Secret) =>
  secret &&
  k8sDelete({
    model: SecretModel,
    resource: secret,
  });
