export type SSHSecretDetails = {
  sshSecretName: string;
  sshSecretKey: string;
};

export enum SecretSelectionOption {
  none = 'none',
  useExisting = 'useExisting',
  addNew = 'addNew',
}
