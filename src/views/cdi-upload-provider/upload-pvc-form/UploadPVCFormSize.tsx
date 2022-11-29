import React, { useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Dropdown, DropdownItem, DropdownToggle, NumberInput } from '@patternfly/react-core';

import { dropdownUnits } from '../utils/consts';

const UploadPVCFormSize = ({
  requestSizeValue,
  requestSizeUnit,
  setRequestSizeValue,
  setRequestSizeUnit,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleRequestSizeInputChange = (obj: { value: number; unit: string }) => {
    setRequestSizeValue(obj?.value);
    setRequestSizeUnit(obj?.unit);
  };

  const onValueChange: React.ReactEventHandler<HTMLInputElement> = (event) => {
    handleRequestSizeInputChange({
      value: Number(event?.currentTarget?.value),
      unit: requestSizeUnit,
    });
  };

  const changeValueBy = (changeBy: number) => {
    // When default defaultRequestSizeValue is not set, value becomes NaN and increment decrement buttons of NumberSpinner don't work.
    const newValue = Number.isFinite(requestSizeValue) ? requestSizeValue + changeBy : 0 + changeBy;
    handleRequestSizeInputChange({ value: newValue, unit: requestSizeUnit });
  };

  const onUnitChange = (newUnit: React.ChangeEvent<HTMLInputElement>) => {
    setIsOpen((open) => !open);
    handleRequestSizeInputChange({
      value: requestSizeValue,
      unit: newUnit?.target?.innerHTML?.slice(0, -1),
    });
  };

  return (
    <>
      <label className="control-label co-required" htmlFor="request-size-input">
        {t('Size')}
      </label>
      <div className="pf-c-input-group">
        <div className="co-m-number-spinner">
          <NumberInput
            min={1}
            value={requestSizeValue}
            id={'request-size-input'}
            required
            name={`requestSizeValue`}
            onMinus={() => changeValueBy(-1)}
            onChange={onValueChange}
            onPlus={() => changeValueBy(1)}
            minusBtnAriaLabel={t('Decrement')}
            plusBtnAriaLabel={t('Increment')}
          />
        </div>
        <Dropdown
          isOpen={isOpen}
          toggle={
            <DropdownToggle
              id="pf-c-console__actions-vnc-toggle-id"
              onToggle={() => setIsOpen(!isOpen)}
            >
              {dropdownUnits?.[requestSizeUnit]}
            </DropdownToggle>
          }
          name={`requestSizeValueUnit`}
          className="request-size-input__unit"
          dropdownItems={Object.values(dropdownUnits)?.map((unit) => (
            <DropdownItem key={unit}>{unit}</DropdownItem>
          ))}
          onSelect={onUnitChange}
        />
      </div>

      <p className="help-block" id="request-size-help">
        {t(
          'Ensure your PVC size covers the requirements of the uncompressed image and any other space requirements.',
        )}
      </p>
    </>
  );
};

export default UploadPVCFormSize;
