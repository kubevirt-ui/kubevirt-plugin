import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getValueByPath } from '@kubevirt-utils/utils/utils';
import { getDNS1120LabelError } from '@kubevirt-utils/utils/validation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { V1DiskFormState } from '../../utils/types';
import { DISK_NAME_FIELD, VOLUME_NAME_FIELD } from '../utils/constants';

const DiskNameInput: FC = () => {
  const { t } = useKubevirtTranslation();

  const {
    formState: { errors },
    register,
    setValue,
  } = useFormContext<V1DiskFormState>();

  const validationError = getValueByPath(errors, VOLUME_NAME_FIELD);

  const registered = register(VOLUME_NAME_FIELD, {
    required: true,
    shouldUnregister: true,
    validate: (value) => getDNS1120LabelError(value)?.(t),
  });

  return (
    <FormGroup fieldId="name" isRequired label={t('Name')}>
      <TextInput
        onChange={(event, newName) => {
          registered.onChange(event);
          setValue(DISK_NAME_FIELD, newName);
        }}
        id="name"
        name={registered.name}
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
