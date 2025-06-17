import React, { ChangeEvent, Dispatch, FC, SetStateAction, useCallback } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { QuantityUnit } from '@kubevirt-utils/utils/unitConstants';
import { BinaryUnit } from '@kubevirt-utils/utils/unitConstants';
import { addByteSuffix } from '@kubevirt-utils/utils/units';
import { NumberInput, SelectOption, Split, SplitItem } from '@patternfly/react-core';

type BandwidthInputProps = {
  setState: Dispatch<
    SetStateAction<{
      unit: QuantityUnit;
      value: number;
    }>
  >;
  state: {
    unit: QuantityUnit;
    value: number;
  };
};

const unitOptions = [BinaryUnit.Ki, BinaryUnit.Mi, BinaryUnit.Gi];

const BandwidthInput: FC<BandwidthInputProps> = ({ setState, state }) => {
  const { t } = useKubevirtTranslation();

  const onSelectUnit = useCallback(
    (_, newUnit: QuantityUnit) => {
      setState((prev) => ({ ...prev, unit: newUnit }));
    },
    [setState],
  );

  return (
    <Split hasGutter>
      <SplitItem>
        <NumberInput
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            +event.target.value >= 0 &&
            setState((prev) => ({ ...prev, value: +event.target.value }))
          }
          min={0}
          minusBtnAriaLabel={t('Decrement')}
          onMinus={() => setState((prev) => ({ ...prev, value: --prev.value }))}
          onPlus={() => setState((prev) => ({ ...prev, value: prev?.value + 1 || 1 }))}
          plusBtnAriaLabel={t('Increment')}
          value={state?.value}
        />
      </SplitItem>
      <SplitItem>
        <FormPFSelect
          onSelect={onSelectUnit}
          selected={state?.unit}
          selectedLabel={addByteSuffix(state?.unit)}
        >
          {unitOptions.map((unitOption) => (
            <SelectOption key={unitOption} value={unitOption}>
              {addByteSuffix(unitOption)}
            </SelectOption>
          ))}
        </FormPFSelect>
      </SplitItem>
    </Split>
  );
};

export default BandwidthInput;
