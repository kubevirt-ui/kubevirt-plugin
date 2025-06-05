import React, { FC, useMemo } from 'react';

import { NumberOperator } from '@kubevirt-utils/utils/constants';
import { getSelectDataTestProps } from '@kubevirt-utils/utils/selectDataTest';
import { SimpleSelect, SimpleSelectOption } from '@patternfly/react-templates';

import { numberOperatorSelectOptions } from './constants';

type NumberOperatorSelectProps = {
  'data-test'?: string;
  onSelect: (value: NumberOperator) => void;
  selected: NumberOperator;
};

const NumberOperatorSelect: FC<NumberOperatorSelectProps> = ({
  'data-test': dataTest,
  onSelect,
  selected,
}) => {
  const initialOptions = useMemo<SimpleSelectOption[]>(
    () =>
      numberOperatorSelectOptions.map((option) => ({
        ...option,
        selected: option.value === selected,
      })),
    [selected],
  );

  return (
    <SimpleSelect
      initialOptions={initialOptions}
      onSelect={(_, selection: NumberOperator) => onSelect(selection)}
      {...getSelectDataTestProps(dataTest)}
    />
  );
};

export default NumberOperatorSelect;
