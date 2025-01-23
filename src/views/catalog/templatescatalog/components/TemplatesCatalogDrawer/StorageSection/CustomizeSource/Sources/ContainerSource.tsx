import React, { Dispatch, FC, FormEventHandler, SetStateAction } from 'react';
import { useFormContext } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormPasswordInput } from '@kubevirt-utils/components/FormPasswordInput/FormPasswordInput';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

type ContainerSourceProps = {
  onInputValueChange: FormEventHandler<HTMLInputElement>;
  registryCredentials: { password: string; username: string };
  registrySourceHelperText: string;
  selectedSourceType: string;
  setRegistryCredentials: Dispatch<SetStateAction<{ password: string; username: string }>>;
  testId: string;
};

const ContainerSource: FC<ContainerSourceProps> = ({
  onInputValueChange,
  registryCredentials,
  registrySourceHelperText,
  selectedSourceType,
  setRegistryCredentials,
  testId,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    formState: { errors },
    register,
  } = useFormContext();

  const validated = errors?.[`${testId}-containerImage`]
    ? ValidatedOptions.error
    : ValidatedOptions.default;

  const handleCredentialsChange = (e, field: 'password' | 'username') => {
    setRegistryCredentials({ ...registryCredentials, [field]: e.target.value });
  };

  return (
    <>
      <FormGroup
        className="disk-source-form-group"
        fieldId={`${testId}-${selectedSourceType}`}
        isRequired
        label={t('Container Image')}
      >
        <FormTextInput
          {...register(`${testId}-containerImage`, { required: true })}
          aria-label={t('Container Image')}
          data-test-id={`${testId}-container-source-input`}
          id={`${testId}-${selectedSourceType}`}
          onChange={onInputValueChange}
          type="text"
          validated={validated}
        />
        <FormGroupHelperText validated={validated}>
          {errors?.[`${testId}-containerImage`]
            ? t('This field is required')
            : registrySourceHelperText}
        </FormGroupHelperText>
      </FormGroup>
      <FormGroup
        className="disk-source-form-group"
        fieldId={`${testId}-${selectedSourceType}-username`}
        label={t('Username')}
      >
        <FormTextInput
          {...register(`${testId}-username`)}
          validated={
            errors?.[`${testId}-username`] ? ValidatedOptions.error : ValidatedOptions.default
          }
          aria-label={t('Username')}
          data-test-id={`${testId}-container-source-username`}
          id={`${testId}-${selectedSourceType}-username`}
          onChange={(e) => handleCredentialsChange(e, 'username')}
          type="text"
        />
      </FormGroup>
      <FormGroup
        className="disk-source-form-group"
        fieldId={`${testId}-${selectedSourceType}-password`}
        label={t('Password')}
      >
        <FormPasswordInput
          {...register(`${testId}-password`)}
          validated={
            errors?.[`${testId}-password`] ? ValidatedOptions.error : ValidatedOptions.default
          }
          aria-label={t('Password')}
          data-test-id={`${testId}-container-source-password`}
          id={`${testId}-${selectedSourceType}`}
          onChange={(e) => handleCredentialsChange(e, 'password')}
          type="text"
        />
      </FormGroup>
    </>
  );
};

export default ContainerSource;
