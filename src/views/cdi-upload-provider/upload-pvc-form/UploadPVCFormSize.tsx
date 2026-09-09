import React, {
  type Dispatch,
  type FC,
  type MouseEvent,
  type ReactEventHandler,
  type SetStateAction,
} from 'react';

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

type UploadPVCFormSizeProps = {
  requestSizeUnit: string;
  requestSizeValue: string;
  setRequestSizeUnit: Dispatch<SetStateAction<string>>;
  setRequestSizeValue: Dispatch<SetStateAction<string>>;
};

const UploadPVCFormSize: FC<UploadPVCFormSizeProps> = ({
  requestSizeUnit,
  requestSizeValue,
  setRequestSizeUnit,
  setRequestSizeValue,
}) => {
  const { t } = useKubevirtTranslation();

  const handleRequestSizeInputChange = (obj: { unit: string; value: number }): void => {
    setRequestSizeValue(String(obj?.value));
    setRequestSizeUnit(obj?.unit);
  };

  const onValueChange: ReactEventHandler<HTMLInputElement> = (event): void => {
    handleRequestSizeInputChange({
      unit: requestSizeUnit,
      value: Number(event?.currentTarget?.value),
    });
  };

  const changeValueBy = (changeBy: number): void => {
    // When default defaultRequestSizeValue is not set, value becomes NaN and increment decrement buttons of NumberSpinner don't work.
    const numericValue = Number(requestSizeValue);
    const newValue = Number.isFinite(numericValue) ? numericValue + changeBy : 0 + changeBy;
    handleRequestSizeInputChange({ unit: requestSizeUnit, value: newValue });
  };

  const onUnitChange = (_event: MouseEvent<HTMLInputElement>, value: string): void => {
    handleRequestSizeInputChange({
      unit: value,
      value: Number(requestSizeValue),
    });
  };

  const unitLabel = dropdownUnits[requestSizeUnit as keyof typeof dropdownUnits];

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
          value={Number(requestSizeValue)}
        />
        <FormPFSelect onSelect={onUnitChange} selected={requestSizeUnit} selectedLabel={unitLabel}>
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
