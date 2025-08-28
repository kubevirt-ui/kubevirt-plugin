import React, { ChangeEvent, FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { BinaryUnit } from '@kubevirt-utils/utils/unitConstants';
import { addByteSuffix, quantityToString, toQuantity } from '@kubevirt-utils/utils/units';
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

import useUnitOptions from './useUnitOptions';
import { getErrorValue } from './utils';

type CapacityInputProps = {
  helperText?: string;
  isDisabled?: boolean;
  isEditingCreatedDisk?: boolean;
  isMinusDisabled?: boolean;
  label?: string;
  minValue?: number;
  onChange: (quantityString: string) => void;
  /** size must be in a Kubernetes Quantity format: https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/quantity/ */
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

  const { unit, value } = toQuantity(size);

  const onValueChange = (newValue: number) => {
    onChange(quantityToString({ unit, value: newValue }));
  };

  const onUnitChange = (_, newUnit: BinaryUnit) => {
    onChange(quantityToString({ unit: newUnit, value }));
  };

  const onMinus = () => onValueChange(Number.isInteger(value) ? value - 1 : Math.floor(value));

  const onPlus = () =>
    value < Number.MAX_SAFE_INTEGER &&
    onValueChange(Number.isInteger(value) ? value + 1 : Math.ceil(value));

  const unitOptions = useUnitOptions(size);

  const validated: ValidatedOptions =
    !value || value <= 0 || (minValue && value < minValue)
      ? ValidatedOptions.error
      : ValidatedOptions.default;

  return (
    <FormGroup className="disk-source-form-group" fieldId="size-required" isRequired label={label}>
      <Split hasGutter>
        <SplitItem>
          <NumberInput
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const numberValue = Number(event.target.value);
              if (
                Number.isInteger(numberValue) &&
                numberValue >= 1 &&
                numberValue <= Number.MAX_SAFE_INTEGER
              ) {
                onValueChange(numberValue);
              }
            }}
            isDisabled={isDisabled || isEditingCreatedDisk}
            max={Number.MAX_SAFE_INTEGER}
            min={1}
            minusBtnAriaLabel={t('Decrement')}
            minusBtnProps={{ isDisabled: isDisabled || isMinusDisabled }}
            onMinus={onMinus}
            onPlus={onPlus}
            plusBtnAriaLabel={t('Increment')}
            value={value}
          />
        </SplitItem>
        <SplitItem>
          <FormPFSelect
            isDisabled={isDisabled}
            onSelect={onUnitChange}
            selected={addByteSuffix(unit)}
          >
            <SelectList>
              {unitOptions.map((unitOption) => (
                <SelectOption isDisabled={isEditingCreatedDisk} key={unitOption} value={unitOption}>
                  {addByteSuffix(unitOption)}
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
            {value > 0 && ` ${minValue} ${addByteSuffix(unit)}`}
          </>
        )}
      </FormGroupHelperText>
      {helperText && <FormGroupHelperText>{helperText}</FormGroupHelperText>}
    </FormGroup>
  );
};

export default CapacityInput;
