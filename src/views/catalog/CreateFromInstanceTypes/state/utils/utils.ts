import { SecretModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { initialSSHCredentials } from '@kubevirt-utils/components/SSHSecretModal/utils/constants';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import { decodeSecret } from '@kubevirt-utils/resources/secret/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

export const getSSHCredentials = (
  sshSecretName: string,
  sshSecretNamespace: string,
  sshSecretCluster?: string,
): Promise<SSHSecretDetails> | SSHSecretDetails => {
  if (isEmpty(sshSecretName)) return initialSSHCredentials;

  return kubevirtK8sGet<IoK8sApiCoreV1Secret>({
    cluster: sshSecretCluster,
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
