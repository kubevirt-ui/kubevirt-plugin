import { useMemo } from 'react';
import DurationOption from 'src/views/clusteroverview/MonitoringTab/top-consumers-card/utils/DurationOption';

import { SINGLE_VM_DURATION } from '@kubevirt-utils/components/Charts/utils/utils';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';

type UseDuration = () => {
  currentTime: number;
  duration: string;
  durationMilliseconds: number;
  setDuration: (newValue: string) => void;
};

const useDuration: UseDuration = () => {
  const [duration, setDuration] = useLocalStorage(
    SINGLE_VM_DURATION,
    DurationOption.FIVE_MIN.toString(),
  );
  const currentTime = useMemo<number>(() => Date.now(), []);
  const durationMilliseconds = DurationOption?.getMilliseconds(duration);

  return { currentTime, duration, durationMilliseconds, setDuration };
};

export default useDuration;
