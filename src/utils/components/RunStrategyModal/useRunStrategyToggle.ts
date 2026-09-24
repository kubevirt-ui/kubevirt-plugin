import { useCallback, useEffect, useRef, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getDefaultRunningStrategy,
  RunStrategy,
  RUNSTRATEGY_MANUAL,
} from '@kubevirt-utils/resources/vm/utils/constants';
import { getEffectiveRunStrategy } from '@kubevirt-utils/resources/vm/utils/selectors';

import { getToggledRunStrategy, isRunStrategyManual, isRunStrategyNotHalted } from './utils';

type UseRunStrategyToggleResult = {
  isStartChecked: boolean;
  onToggle: (checked: boolean) => { newStrategy: RunStrategy };
};

export const useRunStrategyToggle = (
  vmOrRunStrategy: RunStrategy | undefined | V1VirtualMachine,
): UseRunStrategyToggleResult => {
  const runStrategy =
    typeof vmOrRunStrategy === 'string'
      ? vmOrRunStrategy
      : getEffectiveRunStrategy(vmOrRunStrategy);

  const isManual = isRunStrategyManual(runStrategy);
  const isActive = isRunStrategyNotHalted(runStrategy);

  const previousRunStrategyRef = useRef(getDefaultRunningStrategy());
  const [manualChecked, setManualChecked] = useState(isActive);

  useEffect(() => {
    if (!isManual) {
      setManualChecked(isActive);
    }
  }, [isManual, isActive]);

  useEffect(() => {
    if (isActive && !isManual && runStrategy !== previousRunStrategyRef.current) {
      previousRunStrategyRef.current = runStrategy;
    }
  }, [isActive, isManual, runStrategy]);

  const isStartChecked = isManual ? manualChecked : isActive;

  const onToggle = useCallback(
    (checked: boolean): { newStrategy: RunStrategy } => {
      if (isManual) {
        setManualChecked(checked);
        return { newStrategy: RUNSTRATEGY_MANUAL };
      }
      const { newStrategy, savedPrevious } = getToggledRunStrategy(
        checked,
        runStrategy,
        previousRunStrategyRef.current,
      );
      previousRunStrategyRef.current = savedPrevious;
      return { newStrategy };
    },
    [isManual, runStrategy],
  );

  return { isStartChecked, onToggle };
};
