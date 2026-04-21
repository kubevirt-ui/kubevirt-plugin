import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NumberOperator, numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { getSelectDataTestProps } from '@kubevirt-utils/utils/selectDataTest';
import { SimpleSelect, SimpleSelectOption } from '@patternfly/react-templates';

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
  const { t } = useKubevirtTranslation();

  const initialOptions = useMemo<SimpleSelectOption[]>(() => {
    const operators = Object.keys(NumberOperator) as NumberOperator[];
    return operators.map((operator) => ({
      content: t(numberOperatorInfo[operator].text),
      selected: operator === selected,
      value: operator,
    }));
  }, [selected, t]);

  return (
    <SimpleSelect
      initialOptions={initialOptions}
      key={`number-operator-${selected}`}
      onSelect={(_, selection: NumberOperator) => onSelect(selection)}
      {...getSelectDataTestProps(dataTest)}
    />
  );
};

export default NumberOperatorSelect;
