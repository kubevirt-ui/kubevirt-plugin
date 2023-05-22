import { SecretSelectionOption, SSHSecretDetails } from './types';

export const initialSSHCredentials: SSHSecretDetails = {
  sshSecretName: '',
  sshPubKey: '',
  secretOption: SecretSelectionOption.none,
};
