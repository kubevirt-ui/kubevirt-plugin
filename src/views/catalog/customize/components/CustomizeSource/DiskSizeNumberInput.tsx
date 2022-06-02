import * as React from 'react';

import { PVC_SIZE_FORMATS } from '@catalog/customize/components/CustomizeSource';
import { bytesFromQuantity } from '@catalog/utils/quantity';
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

type DiskSizeNumberInputProps = {
  diskSize: string;
  onChange: (quantity: string) => void;
};

const DiskSizeNumberInput: React.FC<DiskSizeNumberInputProps> = ({ diskSize, onChange }) => {
  const { t } = useKubevirtTranslation();

  const [value, quantityUnit] = bytesFromQuantity(diskSize);

  const [selectOpen, toggleSelect] = React.useState(false);

  const onFormatChange = React.useCallback(
    (event, newUnit: PVC_SIZE_FORMATS) => {
      onChange(`${value}${newUnit}`);
      toggleSelect(false);
    },
    [onChange, value],
  );

  const onMinus = React.useCallback(() => {
    if (value > 0) onChange(`${(value || 0) - 1}${quantityUnit}`);
  }, [onChange, quantityUnit, value]);

  const onPlus = React.useCallback(
    () => onChange(`${(value || 0) + 1}${quantityUnit}`),
    [onChange, quantityUnit, value],
  );

  const onChangeSize = React.useCallback(
    (event) => onChange(`${Number(event.currentTarget.value)}${quantityUnit}`),
    [onChange, quantityUnit],
  );

  const unitOptions = Object.values(PVC_SIZE_FORMATS);

  if (!unitOptions?.includes(quantityUnit as PVC_SIZE_FORMATS)) {
    unitOptions.push(quantityUnit as PVC_SIZE_FORMATS);
  }

  return (
    <FormGroup
      label={t('Disk size')}
      fieldId={`pvc-size-required`}
      isRequired
      validated={!value || value <= 0 ? ValidatedOptions.error : ValidatedOptions.default}
      helperTextInvalid={t('Volume size cannot be {{errorValue}}', {
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

export default DiskSizeNumberInput;
