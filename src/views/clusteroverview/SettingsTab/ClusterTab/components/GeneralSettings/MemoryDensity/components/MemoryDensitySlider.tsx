import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Content, ContentVariants, Slider, StackItem } from '@patternfly/react-core';

import { MEMORY_OVERCOMMIT_END_VALUE, MEMORY_OVERCOMMIT_STARTING_VALUE } from '../utils/const';
import { generateSliderSteps, verifyMemoryOvercommitValue } from '../utils/utils';

import '../memory-density.scss';

const MEMORY_DENSITY_CUSTOM_STEPS = generateSliderSteps();

type MemoryDensitySliderProps = {
  hasChanged: boolean;
  inputValue: number;
  isLoading: boolean;
  onSave: () => void;
  onSliderChange: (value: number) => void;
};

const MemoryDensitySlider: FC<MemoryDensitySliderProps> = ({
  hasChanged,
  inputValue,
  isLoading,
  onSave,
  onSliderChange,
}) => {
  const { t } = useKubevirtTranslation();

  const handleChange = (
    _event,
    value: number,
    sliderInputValue?: number,
    setLocalInputValue?: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    if (sliderInputValue === undefined) {
      onSliderChange(value);
      return;
    }

    const newValue = verifyMemoryOvercommitValue(sliderInputValue);
    setLocalInputValue?.(newValue);
    onSliderChange(newValue);
  };

  return (
    <StackItem>
      <Content component={ContentVariants.h6}>{t('Requested memory density')}</Content>
      <div className="pf-v6-u-mt-sm memory-density-slider">
        <Slider
          aria-label={t('Memory density percentage')}
          customSteps={MEMORY_DENSITY_CUSTOM_STEPS}
          data-test-id="memory-density-slider"
          inputLabel="%"
          inputValue={inputValue}
          isDisabled={isLoading}
          isInputVisible
          max={MEMORY_OVERCOMMIT_END_VALUE}
          min={MEMORY_OVERCOMMIT_STARTING_VALUE}
          onChange={handleChange}
          value={inputValue}
        />
      </div>
      <div className="pf-v6-u-my-md">
        <Button
          data-test-id="memory-density-save-button"
          isDisabled={isLoading || !hasChanged}
          isLoading={isLoading}
          onClick={() => onSave()}
          variant="secondary"
        >
          {t('Save')}
        </Button>
      </div>
    </StackItem>
  );
};

export default MemoryDensitySlider;
