import React, { FC } from 'react';

import { TextInput } from '@patternfly/react-core';

type NumberInputProps = {
  setValue: (value: number) => void;
  value: number;
};

const NumberInput: FC<NumberInputProps> = ({ setValue, value }) => {
  return (
    <TextInput
      onChange={(_, newValue) => {
        const newNumber = Number(newValue);
        setValue(isNaN(newNumber) ? value : newNumber);
      }}
      placeholder="0"
      type="text"
      value={value || ''}
    />
  );
};

export default NumberInput;
