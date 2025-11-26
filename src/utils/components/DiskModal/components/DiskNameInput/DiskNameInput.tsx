import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { debounce } from 'lodash';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getValueByPath } from '@kubevirt-utils/utils/utils';
import { getDNS1123LabelError } from '@kubevirt-utils/utils/validation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { V1DiskFormState } from '../../utils/types';
import { DISK_NAME_FIELD, VOLUME_NAME_FIELD } from '../utils/constants';

const DiskNameInput: FC<{ isDisabled?: boolean }> = ({ isDisabled }) => {
  const { t } = useKubevirtTranslation();
  const {
    formState: { errors },
    getValues,
    register,
    setValue,
  } = useFormContext<V1DiskFormState>();

  const fieldToRegister = getValues(VOLUME_NAME_FIELD) ? VOLUME_NAME_FIELD : DISK_NAME_FIELD;

  const registered = register(fieldToRegister, {
    required: true,
    shouldUnregister: true,
    validate: (value) => getDNS1123LabelError(value)?.(t),
  });

  const validationError = getValueByPath(errors, fieldToRegister);

  const debouncedHandler = debounce((event, newName) => {
    registered.onChange(event);
    setValue(DISK_NAME_FIELD, newName);
  }, 300);

  return (
    <FormGroup fieldId="name" isRequired label={t('Name')}>
      <TextInput
        id="name"
        isDisabled={isDisabled}
        name={registered.name}
        onChange={debouncedHandler}
        ref={registered.ref}
        validated={validationError ? 'error' : 'default'}
      />
      {!!validationError?.message && (
        <FormGroupHelperText validated={ValidatedOptions.error}>
          {validationError.message}
        </FormGroupHelperText>
      )}
    </FormGroup>
  );
};

export default DiskNameInput;
