import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, NumberInput } from '@patternfly/react-core';

type QuotaCreateFormResourceLimitInputProps = {
  resourceLimitLabel: string;
  setValue: (value: number) => void;
  unitLabel: string;
  value: number;
};

const QuotaCreateFormResourceLimitInput: FC<QuotaCreateFormResourceLimitInputProps> = ({
  resourceLimitLabel,
  setValue,
  unitLabel,
  value,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup isRequired label={resourceLimitLabel}>
      <NumberInput
        className="pf-v6-u-mr-sm"
        min={0}
        minusBtnAriaLabel={t('Decrement')}
        onChange={(event) => setValue(Number(event.currentTarget?.value))}
        onMinus={() => setValue(value - 1)}
        onPlus={() => setValue(value + 1)}
        plusBtnAriaLabel={t('Increment')}
        value={value}
      />
      <span>{unitLabel}</span>
    </FormGroup>
  );
};

export default QuotaCreateFormResourceLimitInput;
