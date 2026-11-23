import { type IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

export enum SecretSelectionOption {
  AddNew = 'addNew',
  None = 'none',
  UseExisting = 'useExisting',
}

export type SSHSecretDetails = {
  // Flag to indicate if key from user setting is applied
  appliedDefaultKey?: boolean;
  // Flag to indicate if new SSH key is the new preferred key in the user settings
  applyKeyToProject: boolean;
  // selected radio option
  secretOption: SecretSelectionOption;
  // decoded public key value
  sshPubKey: string;
  // The name of Secret resource that holds the ssh public key
  sshSecretName: string;
  // The namespace of secret
  sshSecretNamespace: string;
};

export type SSHOptionUseExistingProps = {
  cluster?: string;
  namespace?: string;
};

export type SSHKeyUploadProps = {
  namespace: string;
};

export type SecretsData = {
  secrets: IoK8sApiCoreV1Secret[];
  secretsLoaded: boolean;
  secretsLoadError: Error | null;
  sshKeySecrets: IoK8sApiCoreV1Secret[];
};
