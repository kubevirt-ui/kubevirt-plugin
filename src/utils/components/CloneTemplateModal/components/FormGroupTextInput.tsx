import type { FC } from 'react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import type { FormGroupProps } from '@patternfly/react-core';
import { FormGroup, TextInput } from '@patternfly/react-core';

type FormGroupTextInputProps = Omit<FormGroupProps, 'fieldId'> & {
  fieldId: string;
};

const FormGroupTextInput: FC<FormGroupTextInputProps> = ({
  children,
  fieldId,
  ...formGroupProps
}) => {
  const { register } = useFormContext();

  return (
    <FormGroup fieldId={fieldId} {...formGroupProps}>
      <TextInput id={fieldId} {...register(fieldId)} />
      {children}
    </FormGroup>
  );
};

export default FormGroupTextInput;
