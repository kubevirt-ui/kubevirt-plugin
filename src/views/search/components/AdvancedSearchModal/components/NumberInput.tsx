import React, { FC } from 'react';

import { TextInput } from '@patternfly/react-core';

type NumberInputProps = {
  setValue: (value: number) => void;
  value: number;
};

const NumberInput: FC<NumberInputProps> = ({ setValue, value, ...props }) => {
  return (
    <TextInput
      onChange={(_, newValue) => {
        if (newValue === '') {
          setValue(NaN);
          return;
        }
        const newNumber = parseInt(newValue);
        setValue(isNaN(newNumber) ? value : newNumber);
      }}
      type="text"
      value={isNaN(value) ? '' : value}
      {...props}
    />
  );
};

export default NumberInput;
