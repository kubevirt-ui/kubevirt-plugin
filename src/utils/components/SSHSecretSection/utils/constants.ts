import { SecretSelectionOption, SSHSecretDetails } from './types';

export const initialSSHCredentials: SSHSecretDetails = {
  appliedDefaultKey: false,
  applyKeyToProject: false,
  secretOption: SecretSelectionOption.none,
  sshPubKey: '',
  sshSecretName: '',
  sshSecretNamespace: '',
};
