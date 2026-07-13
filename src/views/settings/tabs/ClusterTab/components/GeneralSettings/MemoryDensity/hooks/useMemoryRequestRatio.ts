import { useCallback, useEffect, useState } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';

import { MEMORY_REQUEST_RATIO_DEFAULT } from '../utils/const';
import { updateMemoryOvercommit } from '../utils/utils';

type UseMemoryRequestRatioProps = {
  cluster?: string;
  currentOvercommit: number;
  hyperConverge: HyperConverged;
};

type UseMemoryRequestRatioState = {
  hasChanged: boolean;
  inputValue: number;
  isLoading: boolean;
  onChange: (value: number) => void;
  onRestoreDefault: () => void;
  onSave: () => Promise<void>;
};

export const useMemoryRequestRatio = ({
  cluster,
  currentOvercommit,
  hyperConverge,
}: UseMemoryRequestRatioProps): UseMemoryRequestRatioState => {
  const [inputValue, setInputValue] = useState(currentOvercommit ?? MEMORY_REQUEST_RATIO_DEFAULT);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentOvercommit != null) {
      setInputValue(currentOvercommit);
    }
  }, [cluster, currentOvercommit]);

  const onChange = useCallback((value: number) => {
    setInputValue(value);
  }, []);

  const onRestoreDefault = useCallback(() => {
    setInputValue(MEMORY_REQUEST_RATIO_DEFAULT);
  }, []);

  const hasChanged = inputValue !== currentOvercommit;

  const onSave = useCallback(async () => {
    setIsLoading(true);
    try {
      await updateMemoryOvercommit(hyperConverge, inputValue, cluster);
    } finally {
      setIsLoading(false);
    }
  }, [cluster, hyperConverge, inputValue]);

  return {
    hasChanged,
    inputValue,
    isLoading,
    onChange,
    onRestoreDefault,
    onSave,
  };
};
