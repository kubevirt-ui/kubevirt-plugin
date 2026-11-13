import { type FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { type SSHSecretDetails } from '../../utils/types';

const SSHUseExistingCopySecretNameField: FC = () => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<SSHSecretDetails>();
  const sshSecretName = useWatch({ control, name: 'sshSecretName' });
  const secretNameValidated = errors.sshSecretName
    ? ValidatedOptions.error
    : ValidatedOptions.default;

  return (
    <FormGroup label={t('New secret name')}>
      <TextInput
        id="ssh-copy-secret-name"
        onChange={(_event, newSecretName: string) => {
          setValue('sshSecretName', newSecretName, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }}
        type="text"
        validated={secretNameValidated}
        value={sshSecretName ?? ''}
      />
      <FormGroupHelperText validated={secretNameValidated}>
        {errors.sshSecretName?.message}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default SSHUseExistingCopySecretNameField;
