import { SecretSelectionOption, SSHSecretDetails } from './types';

export const initialSSHCredentials: SSHSecretDetails = {
  appliedDefaultKey: false,
  applyKeyToProject: false,
  secretOption: SecretSelectionOption.none,
  sshPubKey: '',
  sshSecretName: '',
  sshSecretNamespace: '',
};

export const MAX_NAME_LENGTH = 253;
export const MAX_SUFFIX_LENGTH = 27;
export const MIN_NAME_LENGTH_FOR_GENERATED_SUFFIX = MAX_NAME_LENGTH - MAX_SUFFIX_LENGTH;
