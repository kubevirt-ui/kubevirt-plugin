export enum SecretSelectionOption {
  none = 'none',
  useExisting = 'useExisting',
  addNew = 'addNew',
}

export type SSHSecretDetails = {
  // The name of Secret resource that holds the ssh public key
  sshSecretName: string;
  // decoded public key value
  sshPubKey: string;
  // selected radio option
  secretOption: SecretSelectionOption;
};
