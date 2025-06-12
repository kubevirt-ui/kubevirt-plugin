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

import {
  CAPACITY_UNITS,
  getErrorValue,
  getUnitFromSize,
  getValueFromSize,
  removeByteSuffix,
} from './utils';

type CapacityInputProps = {
  helperText?: string;
  isDisabled?: boolean;
  isEditingCreatedDisk?: boolean;
  isMinusDisabled?: boolean;
  label?: string;
  minValue?: number;
  onChange: (quantity: string) => void;
  size: string;
};

const CapacityInput: FC<CapacityInputProps> = ({
  helperText,
  isDisabled,
  isEditingCreatedDisk,
  isMinusDisabled,
  label,
  minValue,
  onChange,
  size,
}) => {
  const { t } = useKubevirtTranslation();
  const unit = getUnitFromSize(size);
  const value = getValueFromSize(size);

  const onFormatChange = (_, newUnit: CAPACITY_UNITS) => {
    onChange(`${Number(value)}${removeByteSuffix(newUnit)}`);
  };
  const unitOptions = Object.values(CAPACITY_UNITS);
  if (!unitOptions?.includes(unit)) unitOptions.push(unit);

  const validated: ValidatedOptions =
    !value || value <= 0 || (minValue && value < minValue)
      ? ValidatedOptions.error
      : ValidatedOptions.default;

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
            isDisabled={isDisabled || isEditingCreatedDisk}
            max={Number.MAX_SAFE_INTEGER}
            min={1}
            minusBtnAriaLabel={t('Decrement')}
            minusBtnProps={{ isDisabled: isDisabled || isMinusDisabled }}
            onMinus={() => onChange(`${Number(value) - 1}${removeByteSuffix(unit)}`)}
            plusBtnAriaLabel={t('Increment')}
            value={value}
          />
        </SplitItem>
        <SplitItem>
          <FormPFSelect isDisabled={isDisabled} onSelect={onFormatChange} selected={unit}>
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
        {validated === ValidatedOptions.error && (
          <>
            {t('Size cannot be')} {getErrorValue(value)}
            {value > 0 && ` ${minValue} ${unit}`}
          </>
        )}
      </FormGroupHelperText>
      {helperText && <FormGroupHelperText>{helperText}</FormGroupHelperText>}
    </FormGroup>
  );
};

export default CapacityInput;
