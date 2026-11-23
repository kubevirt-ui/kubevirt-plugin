import { type FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

import {
  getFormFieldErrorMessage,
  getValidatedOptionsFromFieldError,
  SSH_SECRET_TOUCH_VALIDATE_SET_VALUE_OPTIONS,
} from '../../utils/sshSecretFormHelpers';
import { type SSHSecretDetails } from '../../utils/types';

const SSHUseExistingCopySecretNameField: FC = () => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<SSHSecretDetails>();
  const sshSecretName = useWatch({ control, name: 'sshSecretName' });
  const secretNameValidated = getValidatedOptionsFromFieldError(errors.sshSecretName);

  return (
    <FormGroup fieldId="ssh-copy-secret-name" label={t('New secret name')}>
      <TextInput
        id="ssh-copy-secret-name"
        onChange={(_event, newSecretName: string) => {
          setValue('sshSecretName', newSecretName, SSH_SECRET_TOUCH_VALIDATE_SET_VALUE_OPTIONS);
        }}
        type="text"
        validated={secretNameValidated}
        value={sshSecretName ?? ''}
      />
      <FormGroupHelperText validated={secretNameValidated}>
        {getFormFieldErrorMessage(errors.sshSecretName)}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default SSHUseExistingCopySecretNameField;
