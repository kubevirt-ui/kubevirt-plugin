import { useCallback, useEffect, useState } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';

import { updateMemoryOvercommit } from '../utils/utils';

type UseMemoryDensityValueProps = {
  currentOvercommit: number;
  hyperConverge: HyperConverged;
};

type UseMemoryDensityValueState = {
  hasChanged: boolean;
  inputValue: number;
  isLoading: boolean;
  onSave: (valueToSave?: number) => Promise<void>;
  onSliderChange: (value: number) => void;
};

export const useMemoryDensityValue = ({
  currentOvercommit,
  hyperConverge,
}: UseMemoryDensityValueProps): UseMemoryDensityValueState => {
  const [inputValue, setInputValue] = useState(currentOvercommit || 100);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentOvercommit) {
      setInputValue(currentOvercommit);
    }
  }, [currentOvercommit]);

  const onSliderChange = useCallback((value: number) => {
    setInputValue(value);
  }, []);

  const hasChanged = inputValue !== currentOvercommit;

  const onSave = useCallback(
    async (valueToSave?: number) => {
      setIsLoading(true);

      try {
        await updateMemoryOvercommit(hyperConverge, valueToSave ?? inputValue);
      } catch (err) {
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [inputValue, hyperConverge],
  );

  return {
    hasChanged,
    inputValue,
    isLoading,
    onSave,
    onSliderChange,
  };
};
