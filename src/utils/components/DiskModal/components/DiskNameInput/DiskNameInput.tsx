import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { V1DiskFormState } from '../../utils/types';
import { DISK_NAME_FIELD, VOLUME_NAME_FIELD } from '../utils/constants';

const DiskNameInput: FC = () => {
  const { t } = useKubevirtTranslation();

  const { register, setValue } = useFormContext<V1DiskFormState>();

  return (
    <FormGroup fieldId="name" isRequired label={t('Name')}>
      <TextInput
        id="name"
        {...register(VOLUME_NAME_FIELD, {
          required: true,
          shouldUnregister: true,
        })}
        onChange={(_, newName) => {
          setValue(VOLUME_NAME_FIELD, newName);
          setValue(DISK_NAME_FIELD, newName);
        }}
      />
    </FormGroup>
  );
};

export default DiskNameInput;
