import { type FC } from 'react';

import DurationDropdown from '@kubevirt-utils/components/DurationOption/DurationDropdown';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

const TimeDropdown: FC = () => {
  const { duration, setDuration } = useDuration();

  const onDurationSelect = (value: string): void => {
    setDuration(DurationOption.fromDropdownLabel(value).toString());
  };

  return (
    <div>
      <DurationDropdown selectedDuration={duration} selectHandler={onDurationSelect} />
    </div>
  );
};

export default TimeDropdown;
