export enum SecretSelectionOption {
  addNew = 'addNew',
  none = 'none',
  useExisting = 'useExisting',
}

export type SSHSecretDetails = {
  // Flag to indicate if key from user setting is applied
  appliedDefaultKey?: boolean;
  // Flag to indicate if new SSH key is the new preffered key in the user settings
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
