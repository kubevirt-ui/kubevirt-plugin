import { useMemo } from 'react';

import { SINGLE_VM_DURATION } from '@kubevirt-utils/components/Charts/utils/utils';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';

type UseDuration = () => {
  currentTime: number;
  duration: string;
  setDuration: (newValue: string) => void;
  timespan: number;
};

const useDuration: UseDuration = () => {
  const [duration, setDuration] = useLocalStorage(
    SINGLE_VM_DURATION,
    DurationOption.FIVE_MIN.toString(),
  );
  const currentTime = useMemo<number>(() => Date.now(), []);
  const timespan = DurationOption?.getMilliseconds(duration);

  return { currentTime, duration, setDuration, timespan };
};

export default useDuration;
