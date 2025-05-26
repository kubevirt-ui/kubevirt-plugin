import React, { MouseEvent, ReactEventHandler } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  NumberInput,
  SelectOption,
  Split,
} from '@patternfly/react-core';

import { dropdownUnits } from '../utils/consts';

const UploadPVCFormSize = ({
  requestSizeUnit,
  requestSizeValue,
  setRequestSizeUnit,
  setRequestSizeValue,
}) => {
  const { t } = useKubevirtTranslation();

  const handleRequestSizeInputChange = (obj: { unit: string; value: number }) => {
    setRequestSizeValue(obj?.value);
    setRequestSizeUnit(obj?.unit);
  };

  const onValueChange: ReactEventHandler<HTMLInputElement> = (event) => {
    handleRequestSizeInputChange({
      unit: requestSizeUnit,
      value: Number(event?.currentTarget?.value),
    });
  };

  const changeValueBy = (changeBy: number) => {
    // When default defaultRequestSizeValue is not set, value becomes NaN and increment decrement buttons of NumberSpinner don't work.
    const newValue = Number.isFinite(requestSizeValue) ? requestSizeValue + changeBy : 0 + changeBy;
    handleRequestSizeInputChange({ unit: requestSizeUnit, value: newValue });
  };

  const onUnitChange = (_event: MouseEvent<HTMLInputElement>, value: string) => {
    handleRequestSizeInputChange({
      unit: value,
      value: requestSizeValue,
    });
  };

  return (
    <FormGroup fieldId="request-size-input" isRequired label={t('Size')}>
      <Split hasGutter>
        <NumberInput
          aria-describedby="request-size-help"
          id="request-size-input"
          min={1}
          minusBtnAriaLabel={t('Decrement')}
          name="requestSizeValue"
          onChange={onValueChange}
          onMinus={() => changeValueBy(-1)}
          onPlus={() => changeValueBy(1)}
          plusBtnAriaLabel={t('Increment')}
          required
          value={requestSizeValue}
        />
        <FormPFSelect
          onSelect={onUnitChange}
          selected={requestSizeUnit}
          selectedLabel={dropdownUnits[requestSizeUnit]}
        >
          {Object.entries(dropdownUnits)?.map(([value, label]) => (
            <SelectOption key={value} value={value}>
              {label}
            </SelectOption>
          ))}
        </FormPFSelect>
      </Split>
      <FormHelperText>
        <HelperText id="request-size-help">
          {t(
            'Ensure your PVC size covers the requirements of the uncompressed image and any other space requirements.',
          )}
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};

export default UploadPVCFormSize;
