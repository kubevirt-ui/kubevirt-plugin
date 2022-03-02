import * as React from 'react';

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
} from '@patternfly/react-core';

import { PVC_SIZE_FORMATS } from './constants';
import { bytesFromQuantity, ISUnitFromBytes } from './quantity';

type VolumeSizeProps = {
  quantity: string;
  onChange: (quantity: string) => void;
  error?: string;
};

export const VolumeSize: React.FC<VolumeSizeProps> = ({ quantity, onChange, error }) => {
  const { t } = useKubevirtTranslation();

  const [value, quantityUnit] = bytesFromQuantity(quantity);

  const [selectOpen, toggleSelect] = React.useState(false);

  const onFormatChange = React.useCallback(
    (event, newUnit: PVC_SIZE_FORMATS) => {
      onChange(ISUnitFromBytes(`${value}${newUnit}`));
      toggleSelect(false);
    },
    [onChange, value],
  );

  const onMinus = React.useCallback(() => {
    if (value > 0) onChange(ISUnitFromBytes(`${(value || 0) - 1}${quantityUnit}`));
  }, [onChange, quantityUnit, value]);

  const onPlus = React.useCallback(
    () => onChange(ISUnitFromBytes(`${(value || 0) + 1}${quantityUnit}`)),
    [onChange, quantityUnit, value],
  );

  const _onChangeSize = React.useCallback(
    (event) => onChange(ISUnitFromBytes(`${Number(event.currentTarget.value)}${quantityUnit}`)),
    [onChange, quantityUnit],
  );

  const unitOptions = Object.values(PVC_SIZE_FORMATS);

  if (!unitOptions.includes(quantityUnit as PVC_SIZE_FORMATS)) {
    unitOptions.push(quantityUnit as PVC_SIZE_FORMATS);
  }

  return (
    <FormGroup
      label={t('Persistent Volume Claim size')}
      fieldId={`pvc-size-required`}
      isRequired
      className="disk-source-form-group"
      validated={error ? 'error' : 'default'}
      helperTextInvalid={error}
      helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
    >
      <Split hasGutter>
        <SplitItem>
          <NumberInput
            min={1}
            value={value}
            onMinus={onMinus}
            onChange={_onChangeSize}
            onPlus={onPlus}
            minusBtnAriaLabel={t('Decrement')}
            plusBtnAriaLabel={t('Increment')}
          />
        </SplitItem>
        <SplitItem>
          <Select
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
