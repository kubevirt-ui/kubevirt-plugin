import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { initialSSHCredentials } from '@kubevirt-utils/components/SSHSecretSection/utils/constants';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { decodeSecret } from '@kubevirt-utils/resources/secret/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';

export const getSSHCredentials = (
  sshSecretName: string,
  sshSecretNamespace: string,
): Promise<SSHSecretDetails> | SSHSecretDetails => {
  if (isEmpty(sshSecretName)) return initialSSHCredentials;

  return k8sGet<IoK8sApiCoreV1Secret>({
    model: SecretModel,
    name: sshSecretName,
    ns: sshSecretNamespace,
  })
    .then((secret) => ({
      appliedDefaultKey: true,
      applyKeyToProject: false,
      secretOption: SecretSelectionOption.useExisting,
      sshPubKey: decodeSecret(secret),
      sshSecretName,
      sshSecretNamespace,
    }))
    .catch(() => initialSSHCredentials);
};
