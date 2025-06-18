import React, { ChangeEvent, FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { toQuantity } from '@kubevirt-utils/utils/units';
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

import { CAPACITY_UNITS, getErrorValue, removeByteSuffix } from './utils';

type CapacityInputProps = {
  isEditingCreatedDisk?: boolean;
  isMinusDisabled?: boolean;
  label?: string;
  minValue?: number;
  onChange: (quantity: string) => void;
  /** size must be in a Kubernetes Quantity format: https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/quantity/ */
  size: string;
};

const CapacityInput: FC<CapacityInputProps> = ({
  isEditingCreatedDisk,
  isMinusDisabled,
  label,
  minValue,
  onChange,
  size,
}) => {
  const { t } = useKubevirtTranslation();

  const { unit, value } = toQuantity(size);

  const onFormatChange = (_, newUnit: CAPACITY_UNITS) => {
    onChange(`${value}${removeByteSuffix(newUnit)}`);
  };

  const unitOptions = Object.values(CAPACITY_UNITS);
  if (!unitOptions?.includes(unit as CAPACITY_UNITS)) unitOptions.push(unit as CAPACITY_UNITS);

  const validated: ValidatedOptions =
    !value || value <= 0 || (minValue && value < minValue)
      ? ValidatedOptions.error
      : ValidatedOptions.default;

  return (
    <FormGroup className="disk-source-form-group" fieldId="size-required" isRequired label={label}>
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
        {validated === ValidatedOptions.error && (
          <>
            {t('Size cannot be')} {getErrorValue(value)}
            {value > 0 && ` ${minValue} ${unit}`}
          </>
        )}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default CapacityInput;
