import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

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
  const { cluster } = useParams<{ cluster?: string }>();

  const [duration, setDuration] = useLocalStorage(
    SINGLE_VM_DURATION,
    cluster ? DurationOption.FIFTEEN_MIN.toString() : DurationOption.FIVE_MIN.toString(),
  );

  useEffect(() => {
    if (cluster && duration === DurationOption.FIVE_MIN.toString()) {
      setDuration(DurationOption.FIFTEEN_MIN.toString());
    }
  }, [cluster, duration, setDuration]);

  const currentTime = useMemo<number>(() => Date.now(), []);
  const timespan = DurationOption?.getMilliseconds(duration);

  return { currentTime, duration, setDuration, timespan };
};

export default useDuration;
