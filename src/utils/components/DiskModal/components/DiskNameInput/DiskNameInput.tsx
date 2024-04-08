import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { DiskFormState } from '../../utils/types';
import { diskNameField } from '../utils/constants';

const DiskNameInput: FC = () => {
  const { t } = useKubevirtTranslation();

  const { register } = useFormContext<DiskFormState>();
  return (
    <FormGroup fieldId="name" isRequired label={t('Name')}>
      <TextInput
        id="name"
        {...register(diskNameField, { required: true, shouldUnregister: true })}
      />
    </FormGroup>
  );
};

export default DiskNameInput;
