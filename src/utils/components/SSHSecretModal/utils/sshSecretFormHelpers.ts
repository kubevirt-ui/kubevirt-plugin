import { type FieldError, type UseFormSetValue } from 'react-hook-form';
import { type TFunction } from 'i18next';

import { getFieldRequiredMessage } from '@kubevirt-utils/utils/validation';
import { ValidatedOptions } from '@patternfly/react-core';

import { SecretSelectionOption, type SSHSecretDetails } from './types';

export const SSH_SECRET_TOUCH_VALIDATE_SET_VALUE_OPTIONS = {
  shouldDirty: true,
  shouldTouch: true,
  shouldValidate: true,
} as const;

export const ensureAddNewSSHSecretContext = (
  setValue: UseFormSetValue<SSHSecretDetails>,
  namespace: string,
): void => {
  setValue('secretOption', SecretSelectionOption.AddNew, {
    shouldDirty: true,
    shouldValidate: true,
  });
  setValue('sshSecretNamespace', namespace, SSH_SECRET_TOUCH_VALIDATE_SET_VALUE_OPTIONS);
};

export const getValidatedOptionsFromFieldError = (
  fieldError?: FieldError,
): ValidatedOptions.default | ValidatedOptions.error =>
  fieldError ? ValidatedOptions.error : ValidatedOptions.default;

export const getFormFieldErrorMessage = (fieldError?: FieldError): string | undefined =>
  fieldError?.message;

export const createRequiredFieldError = (t: TFunction): { message: string; type: 'required' } => ({
  message: getFieldRequiredMessage(t),
  type: 'required' as const,
});
