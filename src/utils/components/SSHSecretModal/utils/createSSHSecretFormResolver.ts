import { type FieldErrors, type Resolver, type ResolverResult } from 'react-hook-form';
import { type TFunction } from 'i18next';

import { type IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { isEmpty, validateSSHPublicKey } from '@kubevirt-utils/utils/utils';
import { getFieldRequiredMessage } from '@kubevirt-utils/utils/validation';

import { isCopyingSSHSecretToTarget } from './sshSecretHelpers';
import { SecretSelectionOption, type SSHSecretDetails } from './types';
import { getSecretNameErrorMessage } from './utils';

export type SSHSecretFormResolverOptions = {
  namespace: string;
  secrets: IoK8sApiCoreV1Secret[];
  t: TFunction;
};

const resolverResult = (
  values: SSHSecretDetails,
  errors: FieldErrors<SSHSecretDetails>,
): ResolverResult<SSHSecretDetails> =>
  Object.keys(errors).length > 0 ? { errors, values: {} } : { errors: {}, values };

const validateNewSecretName = (
  sshSecretName: string,
  namespace: string,
  secrets: IoK8sApiCoreV1Secret[],
  errors: FieldErrors<SSHSecretDetails>,
): void => {
  const nameErrorMessage = getSecretNameErrorMessage(sshSecretName, namespace, secrets);

  if (nameErrorMessage) {
    errors.sshSecretName = { message: nameErrorMessage, type: 'validate' };
  }
};

const validateSshPubKey = (
  sshPubKey: string,
  t: TFunction,
  errors: FieldErrors<SSHSecretDetails>,
): void => {
  if (isEmpty(sshPubKey)) {
    errors.sshPubKey = { message: getFieldRequiredMessage(t), type: 'required' };
  } else if (!validateSSHPublicKey(sshPubKey)) {
    errors.sshPubKey = { message: t('SSH key is invalid'), type: 'validate' };
  }
};

export const createSSHSecretFormResolver =
  ({ namespace, secrets, t }: SSHSecretFormResolverOptions): Resolver<SSHSecretDetails> =>
  (values) => {
    const { secretOption, sshPubKey, sshSecretName } = values;
    const errors: FieldErrors<SSHSecretDetails> = {};

    if (secretOption === SecretSelectionOption.None) {
      return resolverResult(values, errors);
    }

    if (secretOption === SecretSelectionOption.UseExisting) {
      if (isEmpty(sshSecretName)) {
        errors.sshSecretName = { message: getFieldRequiredMessage(t), type: 'required' };
        return resolverResult(values, errors);
      }

      if (isCopyingSSHSecretToTarget(values, namespace)) {
        validateSshPubKey(sshPubKey, t, errors);
        validateNewSecretName(sshSecretName, namespace, secrets, errors);
      }

      return resolverResult(values, errors);
    }

    validateSshPubKey(sshPubKey, t, errors);

    if (isEmpty(sshSecretName)) {
      errors.sshSecretName = { message: getFieldRequiredMessage(t), type: 'required' };
      return resolverResult(values, errors);
    }

    validateNewSecretName(sshSecretName, namespace, secrets, errors);

    return resolverResult(values, errors);
  };
