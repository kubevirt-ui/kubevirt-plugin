import * as React from 'react';

import { CAPACITY_UNITS } from '@catalog/customize/components/CustomizeSource';
import { bytesFromQuantity } from '@catalog/utils/quantity';
import { removeByteSuffix } from '@kubevirt-utils/components/CapacityInput/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
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

type CapacityInputProps = {
  size: string;
  onChange: (quantity: string) => void;
  label: string;
};

const CapacityInput: React.FC<CapacityInputProps> = ({ size, onChange, label }) => {
  const { t } = useKubevirtTranslation();
  const [selectOpen, toggleSelect] = React.useState(false);

  const [value, quantityUnit] = bytesFromQuantity(size);

  const onFormatChange = React.useCallback(
    (event, newUnit: CAPACITY_UNITS) => {
      onChange(`${value}${removeByteSuffix(newUnit)}`);
      toggleSelect(false);
    },
    [onChange, value],
  );

  const onMinus = React.useCallback(() => {
    if (value > 0) onChange(`${(value || 0) - 1}${removeByteSuffix(quantityUnit)}`);
  }, [onChange, quantityUnit, value]);

  const onPlus = React.useCallback(
    () => onChange(`${(value || 0) + 1}${removeByteSuffix(quantityUnit)}`),
    [onChange, quantityUnit, value],
  );

  const onChangeSize = React.useCallback(
    (event) => onChange(`${Number(event.currentTarget.value)}${removeByteSuffix(quantityUnit)}`),
    [onChange, quantityUnit],
  );

  const unitOptions = Object.values(CAPACITY_UNITS);

  if (!unitOptions?.includes(quantityUnit as CAPACITY_UNITS)) {
    unitOptions.push(quantityUnit as CAPACITY_UNITS);
  }

  return (
    <FormGroup
      label={label}
      fieldId={`size-required`}
      isRequired
      validated={!value || value <= 0 ? ValidatedOptions.error : ValidatedOptions.default}
      helperTextInvalid={t('Size cannot be {{errorValue}}', {
        errorValue: value < 0 ? 'negative' : 'zero',
      })}
      helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
    >
      <Split hasGutter>
        <SplitItem>
          <NumberInput
            min={1}
            value={value}
            onMinus={onMinus}
            onChange={onChangeSize}
            onPlus={onPlus}
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
            selections={quantityUnit}
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
