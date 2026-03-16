import { useCallback, useEffect, useState } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';

import { MEMORY_OVERCOMMIT_STARTING_VALUE } from '../utils/const';
import { updateMemoryOvercommit } from '../utils/utils';

type UseMemoryDensityValueProps = {
  cluster?: string;
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
  cluster,
  currentOvercommit,
  hyperConverge,
}: UseMemoryDensityValueProps): UseMemoryDensityValueState => {
  const [inputValue, setInputValue] = useState(
    currentOvercommit ?? MEMORY_OVERCOMMIT_STARTING_VALUE,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentOvercommit != null) {
      setInputValue(currentOvercommit);
    }
  }, [cluster, currentOvercommit]);

  const onSliderChange = useCallback((value: number) => {
    setInputValue(value);
  }, []);

  const hasChanged = inputValue !== currentOvercommit;

  const onSave = useCallback(
    async (valueToSave?: number) => {
      setIsLoading(true);

      try {
        await updateMemoryOvercommit(hyperConverge, valueToSave ?? inputValue, cluster);
      } catch (err) {
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cluster, inputValue, hyperConverge],
  );

  return {
    hasChanged,
    inputValue,
    isLoading,
    onSave,
    onSliderChange,
  };
};
