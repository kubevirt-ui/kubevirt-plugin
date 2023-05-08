export type SSHSecretDetails = {
  // The name of Secret resource that holds the ssh public key
  sshSecretName: string;
  // decoded public key value
  sshPubKey: string;
  // a flag to indicate if a secret should be created - used on VM creation
  createNewSecret: boolean;
};

export enum SecretSelectionOption {
  none = 'none',
  useExisting = 'useExisting',
  addNew = 'addNew',
}
