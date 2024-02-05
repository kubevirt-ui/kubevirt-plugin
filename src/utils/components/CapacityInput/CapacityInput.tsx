import React, { ChangeEvent, FC, useState } from 'react';

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

import { CAPACITY_UNITS, removeByteSuffix } from './utils';

type CapacityInputProps = {
  label: string;
  onChange: (quantity: string) => void;
  size: string;
};

const CapacityInput: FC<CapacityInputProps> = ({ label, onChange, size }) => {
  const { t } = useKubevirtTranslation();
  const [selectOpen, toggleSelect] = useState<boolean>(false);
  const [unitValue = ''] = size?.match(/[a-zA-Z]+/g) || [];
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
      helperTextInvalid={t('Size cannot be {{errorValue}}', {
        errorValue: value < 0 ? 'negative' : 'zero',
      })}
      className="disk-source-form-group"
      fieldId={`size-required`}
      helperTextInvalidIcon={<ExclamationCircleIcon color="red" title="Error" />}
      isRequired
      label={label}
      validated={!value || value <= 0 ? ValidatedOptions.error : ValidatedOptions.default}
    >
      <Split hasGutter>
        <SplitItem>
          <NumberInput
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              Number(event?.target?.value) <= Number.MAX_SAFE_INTEGER &&
              onChange(`${Number(event.target.value)}${removeByteSuffix(unit)}`)
            }
            onPlus={() =>
              Number(value) < Number.MAX_SAFE_INTEGER &&
              onChange(`${Number(value) + 1}${removeByteSuffix(unit)}`)
            }
            max={Number.MAX_SAFE_INTEGER}
            min={1}
            minusBtnAriaLabel={t('Decrement')}
            onMinus={() => onChange(`${Number(value) - 1}${removeByteSuffix(unit)}`)}
            plusBtnAriaLabel={t('Increment')}
            value={value}
          />
        </SplitItem>
        <SplitItem>
          <Select
            isOpen={selectOpen}
            menuAppendTo="parent"
            onSelect={onFormatChange}
            onToggle={toggleSelect}
            selections={unit}
            variant={SelectVariant.single}
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
