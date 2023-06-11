export enum SecretSelectionOption {
  addNew = 'addNew',
  none = 'none',
  useExisting = 'useExisting',
}

export type SSHSecretDetails = {
  // selected radio option
  secretOption: SecretSelectionOption;
  // decoded public key value
  sshPubKey: string;
  // The name of Secret resource that holds the ssh public key
  sshSecretName: string;
};
