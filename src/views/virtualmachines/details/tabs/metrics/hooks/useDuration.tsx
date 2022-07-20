import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  adjustDurationForStart,
  getCreationTimestamp,
  getDurationMilliseconds,
} from '@kubevirt-utils/components/Charts/utils/utils';

type UseDuration = (
  vmi: V1VirtualMachineInstance,
) => [timespan: number, duration: string, setDuration: Dispatch<SetStateAction<string>>];

const useDuration: UseDuration = (vmi) => {
  const [duration, setDuration] = useState<string>('5m');

  const createdAt = useMemo(() => getCreationTimestamp(vmi), [vmi]);

  const adjustDuration = useCallback(
    (start) => adjustDurationForStart(start, createdAt),
    [createdAt],
  );

  const timespan = useMemo(
    () => adjustDuration(getDurationMilliseconds(duration)),
    [adjustDuration, duration],
  );

  return [timespan, duration, setDuration];
};

export default useDuration;
