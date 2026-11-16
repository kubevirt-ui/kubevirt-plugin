import { type ChangeEvent, type FC, type ReactElement } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type BinaryUnit } from '@kubevirt-utils/utils/unitConstants';
import { addByteSuffix, quantityToString, toQuantity } from '@kubevirt-utils/utils/units';
import { FormGroup, NumberInput, Split, SplitItem, ValidatedOptions } from '@patternfly/react-core';
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
  isRequired?: boolean;
  label?: string;
  labelHelp?: ReactElement;
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
  isRequired = true,
  label,
  labelHelp,
  minValue,
  onChange,
  size,
}): ReactElement => {
  const { t } = useKubevirtTranslation();

  const { unit, value } = toQuantity(size) ?? {};

  const onValueChange = (newValue: number): void => {
    if (!unit) return;
    onChange(quantityToString({ unit, value: newValue }));
  };

  const onUnitChange = (_event: unknown, newUnit: BinaryUnit): void => {
    if (value === undefined) return;
    onChange(quantityToString({ unit: newUnit, value }));
  };

  const minimumValue = minValue ?? 1;

  const onMinus = (): void => {
    if (value === undefined) return;
    const nextValue = Number.isInteger(value) ? value - 1 : Math.floor(value);
    if (nextValue < minimumValue) return;
    onValueChange(nextValue);
  };

  const onPlus = (): void => {
    if (value === undefined || value >= Number.MAX_SAFE_INTEGER) return;
    onValueChange(Number.isInteger(value) ? value + 1 : Math.ceil(value));
  };

  const unitOptions = useUnitOptions(size);

  const validated: ValidatedOptions =
    !value || value < minimumValue ? ValidatedOptions.error : ValidatedOptions.default;

  return (
    <FormGroup
      className="disk-source-form-group"
      fieldId="size-required"
      isRequired={isRequired}
      label={label}
      labelHelp={labelHelp}
    >
      <Split className={label ? 'pf-v6-u-mt-sm' : undefined} hasGutter>
        <SplitItem>
          <NumberInput
            isDisabled={isDisabled || isEditingCreatedDisk}
            max={Number.MAX_SAFE_INTEGER}
            min={minimumValue}
            minusBtnAriaLabel={t('Decrement')}
            minusBtnProps={{
              isDisabled:
                isDisabled || isMinusDisabled || (value !== undefined && value <= minimumValue),
            }}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const numberValue = Number(event.target.value);
              if (
                Number.isInteger(numberValue) &&
                numberValue >= minimumValue &&
                numberValue <= Number.MAX_SAFE_INTEGER
              ) {
                onValueChange(numberValue);
              }
            }}
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
            {unitOptions.map((unitOption) => (
              <SelectOption isDisabled={isEditingCreatedDisk} key={unitOption} value={unitOption}>
                {addByteSuffix(unitOption)}
              </SelectOption>
            ))}
          </FormPFSelect>
        </SplitItem>
      </Split>
      <FormGroupHelperText validated={validated}>
        {validated === ValidatedOptions.error && (
          <>
            {t('Size cannot be')} {getErrorValue(t, value)}
            {value > 0 && ` ${minimumValue} ${addByteSuffix(unit)}`}
          </>
        )}
      </FormGroupHelperText>
      {helperText && <FormGroupHelperText>{helperText}</FormGroupHelperText>}
    </FormGroup>
  );
};

export default CapacityInput;
