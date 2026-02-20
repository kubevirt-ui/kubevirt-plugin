import React, { FC } from 'react';

import { isDigitsOnly } from '@kubevirt-utils/utils/validation';
import { TextInput, TextInputProps } from '@patternfly/react-core';

type NumberTextInputProps = {
  setValue: (value: number) => void;
  value: number;
} & Omit<TextInputProps, 'value'>;

const NumberTextInput: FC<NumberTextInputProps> = ({ setValue, value, ...props }) => {
  return (
    <TextInput
      onChange={(_, newValue) => {
        if (newValue === '') {
          setValue(NaN);
          return;
        }
        if (!isDigitsOnly(newValue)) return;

        const newNumber = parseInt(newValue);
        if (newNumber > Number.MAX_SAFE_INTEGER) return;

        setValue(newNumber);
      }}
      type="text"
      value={isNaN(value) ? '' : value}
      {...props}
    />
  );
};

export default NumberTextInput;
