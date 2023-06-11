import { SecretSelectionOption, SSHSecretDetails } from './types';

export const initialSSHCredentials: SSHSecretDetails = {
  secretOption: SecretSelectionOption.none,
  sshPubKey: '',
  sshSecretName: '',
};
