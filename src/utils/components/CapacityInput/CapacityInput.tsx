import React, { ChangeEvent, FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FormGroup,
  NumberInput,
  SelectList,
  Split,
  SplitItem,
  ValidatedOptions,
} from '@patternfly/react-core';
import { SelectOption } from '@patternfly/react-core';

import FormGroupHelperText from '../FormGroupHelperText/FormGroupHelperText';
import FormPFSelect from '../FormPFSelect/FormPFSelect';

import { CAPACITY_UNITS, removeByteSuffix } from './utils';

type CapacityInputProps = {
  isEditingCreatedDisk?: boolean;
  isMinusDisabled?: boolean;
  label?: string;
  onChange: (quantity: string) => void;
  size: string;
};

const CapacityInput: FC<CapacityInputProps> = ({
  isEditingCreatedDisk,
  isMinusDisabled,
  label,
  onChange,
  size,
}) => {
  const { t } = useKubevirtTranslation();
  const [unitValue = ''] = size?.match(/[a-zA-Z]+/g) || [];
  const [sizeValue = 0] = size?.match(/[0-9]+/g) || [];
  const unit = !unitValue?.endsWith('B') ? `${unitValue}B` : unitValue;
  const value = Number(sizeValue);

  const onFormatChange = (_, newUnit: CAPACITY_UNITS) => {
    onChange(`${Number(value)}${removeByteSuffix(newUnit)}`);
  };
  const unitOptions = Object.values(CAPACITY_UNITS);
  if (!unitOptions?.includes(unit as CAPACITY_UNITS)) unitOptions.push(unit as CAPACITY_UNITS);

  const validated: ValidatedOptions =
    !value || value <= 0 ? ValidatedOptions.error : ValidatedOptions.default;

  return (
    <FormGroup
      className="disk-source-form-group"
      fieldId={`size-required`}
      isRequired
      label={label}
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
            isDisabled={isEditingCreatedDisk}
            max={Number.MAX_SAFE_INTEGER}
            min={1}
            minusBtnAriaLabel={t('Decrement')}
            minusBtnProps={{ isDisabled: isMinusDisabled }}
            onMinus={() => onChange(`${Number(value) - 1}${removeByteSuffix(unit)}`)}
            plusBtnAriaLabel={t('Increment')}
            value={value}
          />
        </SplitItem>
        <SplitItem>
          <FormPFSelect onSelect={onFormatChange} selected={unit}>
            <SelectList>
              {unitOptions.map((formatOption) => (
                <SelectOption
                  isDisabled={isEditingCreatedDisk}
                  key={formatOption}
                  value={formatOption}
                >
                  {formatOption}
                </SelectOption>
              ))}
            </SelectList>
          </FormPFSelect>
        </SplitItem>
      </Split>
      <FormGroupHelperText validated={validated}>
        {validated === ValidatedOptions.error &&
          t('Size cannot be {{errorValue}}', {
            errorValue: value < 0 ? 'negative' : 'zero',
          })}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default CapacityInput;
