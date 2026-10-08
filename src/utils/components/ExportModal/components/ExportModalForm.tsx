import { type FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormPasswordInput } from '@kubevirt-utils/components/FormPasswordInput/FormPasswordInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getFieldValidationState } from '@kubevirt-utils/utils/getFieldValidationState';
import { FormGroup, StackItem, TextInput } from '@patternfly/react-core';

import { type ExportFormValues } from '../types/types';

type ExportModalFormProps = {
  isDisabled: boolean;
};

const ExportModalForm: FC<ExportModalFormProps> = ({ isDisabled }) => {
  const { t } = useKubevirtTranslation();
  const { control } = useFormContext<ExportFormValues>();

  return (
    <>
      <StackItem>
        <FormGroup fieldId="registryName" isRequired label={t('Name')}>
          <Controller
            control={control}
            name="registryName"
            render={({ field, fieldState: { error } }) => {
              const { message, validated } = getFieldValidationState(error);

              return (
                <>
                  <TextInput
                    {...field}
                    id="registryName"
                    isDisabled={isDisabled}
                    type="text"
                    validated={validated}
                  />
                  {error && (
                    <FormGroupHelperText validated={validated}>{message}</FormGroupHelperText>
                  )}
                </>
              );
            }}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup fieldId="destination" isRequired label={t('Destination')}>
          <Controller
            control={control}
            name="destination"
            render={({ field, fieldState: { error } }) => {
              const { message, validated } = getFieldValidationState(error);

              return (
                <>
                  <TextInput
                    {...field}
                    id="destination"
                    isDisabled={isDisabled}
                    type="text"
                    validated={validated}
                  />
                  {error && (
                    <FormGroupHelperText validated={validated}>{message}</FormGroupHelperText>
                  )}
                </>
              );
            }}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup fieldId="username" isRequired label={t('Username')}>
          <Controller
            control={control}
            name="username"
            render={({ field, fieldState: { error } }) => {
              const { message, validated } = getFieldValidationState(error);

              return (
                <>
                  <TextInput
                    {...field}
                    id="username"
                    isDisabled={isDisabled}
                    type="text"
                    validated={validated}
                  />
                  {error && (
                    <FormGroupHelperText validated={validated}>{message}</FormGroupHelperText>
                  )}
                </>
              );
            }}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup fieldId="password" isRequired label={t('Password')}>
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState: { error } }) => {
              const { message, validated } = getFieldValidationState(error);

              return (
                <>
                  <FormPasswordInput
                    {...field}
                    id="password"
                    isDisabled={isDisabled}
                    validated={validated}
                  />
                  {error && (
                    <FormGroupHelperText validated={validated}>{message}</FormGroupHelperText>
                  )}
                </>
              );
            }}
          />
        </FormGroup>
      </StackItem>
    </>
  );
};

export default ExportModalForm;
