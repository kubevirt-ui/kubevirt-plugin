import * as React from 'react';

import DurationDropdown from '@kubevirt-utils/components/DurationOption/DurationDropdown';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

const TimeDropdown: React.FC = () => {
  const { duration, setDuration } = useDuration();

  const onDurationSelect = (value: string) =>
    setDuration(DurationOption.fromDropdownLabel(value).toString());

  return (
    <div className="duration-select" data-test-id="duration-select">
      <DurationDropdown selectedDuration={duration} selectHandler={onDurationSelect} />
    </div>
  );
};

export default TimeDropdown;
