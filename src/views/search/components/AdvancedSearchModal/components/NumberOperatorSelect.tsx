import React, { FC, useMemo } from 'react';

import { SimpleSelect, SimpleSelectOption } from '@patternfly/react-templates';

export enum NumberOperator {
  Equals = 'Equals',
  GreaterThan = 'GreaterThan',
  LessThan = 'LessThan',
}

type NumberOperatorSelectProps = {
  onSelect: (value: NumberOperator) => void;
  selected: NumberOperator;
};

const NumberOperatorSelect: FC<NumberOperatorSelectProps> = ({ onSelect, selected }) => {
  const initialOptions = useMemo<SimpleSelectOption[]>(
    () =>
      [
        { content: 'Greater than', value: NumberOperator.GreaterThan },
        { content: 'Less than', value: NumberOperator.LessThan },
        { content: 'Equals', value: NumberOperator.Equals },
      ].map((option) => ({ ...option, selected: option.value === selected })),
    [selected],
  );

  return (
    <SimpleSelect
      initialOptions={initialOptions}
      onSelect={(_, selection: NumberOperator) => onSelect(selection)}
    />
  );
};

export default NumberOperatorSelect;
