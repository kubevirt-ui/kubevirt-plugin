import React, { useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Dropdown, DropdownItem, DropdownToggle, NumberInput } from '@patternfly/react-core';

import { dropdownUnits } from '../utils/consts';

const UploadPVCFormSize = ({
  requestSizeUnit,
  requestSizeValue,
  setRequestSizeUnit,
  setRequestSizeValue,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleRequestSizeInputChange = (obj: { unit: string; value: number }) => {
    setRequestSizeValue(obj?.value);
    setRequestSizeUnit(obj?.unit);
  };

  const onValueChange: React.ReactEventHandler<HTMLInputElement> = (event) => {
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

  const onUnitChange = (newUnit: React.ChangeEvent<HTMLInputElement>) => {
    setIsOpen((open) => !open);
    handleRequestSizeInputChange({
      unit: newUnit?.target?.innerHTML?.slice(0, -1),
      value: requestSizeValue,
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
            id={'request-size-input'}
            min={1}
            minusBtnAriaLabel={t('Decrement')}
            name={`requestSizeValue`}
            onChange={onValueChange}
            onMinus={() => changeValueBy(-1)}
            onPlus={() => changeValueBy(1)}
            plusBtnAriaLabel={t('Increment')}
            required
            value={requestSizeValue}
          />
        </div>
        <Dropdown
          dropdownItems={Object.values(dropdownUnits)?.map((unit) => (
            <DropdownItem key={unit}>{unit}</DropdownItem>
          ))}
          toggle={
            <DropdownToggle
              id="pf-c-console__actions-vnc-toggle-id"
              onToggle={() => setIsOpen(!isOpen)}
            >
              {dropdownUnits?.[requestSizeUnit]}
            </DropdownToggle>
          }
          className="request-size-input__unit"
          isOpen={isOpen}
          name={`requestSizeValueUnit`}
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
