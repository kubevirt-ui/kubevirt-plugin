import { type Dispatch, type SetStateAction } from 'react';

import { type IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

export enum SecretSelectionOption {
  AddNew = 'addNew',
  None = 'none',
  UseExisting = 'useExisting',
}

export type SSHSecretDetails = {
  // Flag to indicate if key from user setting is applied
  appliedDefaultKey?: boolean;
  // Flag to indicate if new SSH key is the new preferred key in the user settings
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

export type SSHOptionUseExistingProps = {
  cluster?: string;
  localNSProject: string;
  namespace?: string;
  projectsWithSecrets: { [namespace: string]: IoK8sApiCoreV1Secret[] };
  secrets: IoK8sApiCoreV1Secret[];
  secretsLoaded: boolean;
  setLocalNSProject: Dispatch<SetStateAction<string>>;
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
  sshDetails: SSHSecretDetails;
};

export type SecretsData = {
  allSecrets: IoK8sApiCoreV1Secret[];
  projectsWithSecrets: { [p: string]: IoK8sApiCoreV1Secret[] };
  secretsLoaded: boolean;
  secretsLoadError: Error;
};
