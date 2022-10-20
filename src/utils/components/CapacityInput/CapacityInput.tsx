import React, { useState } from 'react';

import { CAPACITY_UNITS } from '@catalog/customize/components/CustomizeSource';
import { removeByteSuffix } from '@kubevirt-utils/components/CapacityInput/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FormGroup,
  NumberInput,
  Select,
  SelectOption,
  SelectVariant,
  Split,
  SplitItem,
  ValidatedOptions,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

type CapacityInputProps = {
  size: string;
  onChange: (quantity: string) => void;
  label: string;
};

const CapacityInput: React.FC<CapacityInputProps> = ({ size, onChange, label }) => {
  const { t } = useKubevirtTranslation();
  const [selectOpen, toggleSelect] = useState<boolean>(false);
  const [unitValue] = size?.match(/[a-zA-Z]+/g);
  const [sizeValue = 0] = size?.match(/[0-9]+/g) || [];
  const unit = !unitValue?.endsWith('B') ? `${unitValue}B` : unitValue;
  const value = Number(sizeValue);

  const onFormatChange = (_, newUnit: CAPACITY_UNITS) => {
    onChange(`${Number(value)}${removeByteSuffix(newUnit)}`);
    toggleSelect(false);
  };
  const unitOptions = Object.values(CAPACITY_UNITS);
  if (!unitOptions?.includes(unit as CAPACITY_UNITS)) unitOptions.push(unit as CAPACITY_UNITS);

  return (
    <FormGroup
      label={label}
      fieldId={`size-required`}
      isRequired
      validated={!value || value <= 0 ? ValidatedOptions.error : ValidatedOptions.default}
      helperTextInvalid={t('Size cannot be {{errorValue}}', {
        errorValue: value < 0 ? 'negative' : 'zero',
      })}
      helperTextInvalidIcon={<ExclamationCircleIcon color="red" title="Error" />}
    >
      <Split hasGutter>
        <SplitItem>
          <NumberInput
            min={1}
            value={value}
            max={Number.MAX_SAFE_INTEGER}
            onMinus={() => onChange(`${Number(value) - 1}${removeByteSuffix(unit)}`)}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              Number(event?.target?.value) <= Number.MAX_SAFE_INTEGER &&
              onChange(`${Number(event.target.value)}${removeByteSuffix(unit)}`)
            }
            onPlus={() =>
              Number(value) < Number.MAX_SAFE_INTEGER &&
              onChange(`${Number(value) + 1}${removeByteSuffix(unit)}`)
            }
            minusBtnAriaLabel={t('Decrement')}
            plusBtnAriaLabel={t('Increment')}
          />
        </SplitItem>
        <SplitItem>
          <Select
            menuAppendTo="parent"
            isOpen={selectOpen}
            onToggle={toggleSelect}
            onSelect={onFormatChange}
            variant={SelectVariant.single}
            selections={unit}
          >
            {unitOptions.map((formatOption) => (
              <SelectOption key={formatOption} value={formatOption} />
            ))}
          </Select>
        </SplitItem>
      </Split>
    </FormGroup>
  );
};

export default CapacityInput;
