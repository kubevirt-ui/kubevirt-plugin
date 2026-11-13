import { SecretSelectionOption, type SSHSecretDetails } from './types';

export const initialSSHCredentials: SSHSecretDetails = {
  appliedDefaultKey: false,
  applyKeyToProject: false,
  secretOption: SecretSelectionOption.None,
  sshPubKey: '',
  sshSecretName: '',
  sshSecretNamespace: '',
};

export const initialSysprepData = { data: {}, name: '', shouldCreateNewConfigMap: false };

/** Secret names above this length can prevent the VM from starting (cloud-init / accessCredentials). */
export const ADD_NEW_SSH_SECRET_NAME_MAX_LENGTH = 51;

export const MAX_NAME_LENGTH = 253;
export const MAX_SUFFIX_LENGTH = 27;
export const MIN_NAME_LENGTH_FOR_GENERATED_SUFFIX = MAX_NAME_LENGTH - MAX_SUFFIX_LENGTH;

export const DYNAMIC_SSH_INJECTION_CMD = 'setsebool -P virt_qemu_ga_manage_ssh on';
