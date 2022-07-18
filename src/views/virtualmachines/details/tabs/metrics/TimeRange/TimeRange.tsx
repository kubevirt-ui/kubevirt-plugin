import React from 'react';
import { Link } from 'react-router-dom';
import DurationDropdown from 'src/views/clusteroverview/MonitoringTab/top-consumers-card/utils/DurationDropdown';
import DurationOption from 'src/views/clusteroverview/MonitoringTab/top-consumers-card/utils/DurationOption';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type TimeDurationProps = {
  duration: string;
  setDuration: (value: string) => void;
};

const TimeRange: React.FC<TimeDurationProps> = ({ duration, setDuration }) => {
  const { t } = useKubevirtTranslation();
  const onDurationSelect = (value: string) =>
    setDuration(DurationOption.fromDropdownLabel(value).toString());

  return (
    <div className="timerange--main">
      <span className="timerange--main__text">
        <span className="timerange--main__text--title">{t('Time range')}</span>
        <DurationDropdown selectedDuration={duration} selectHandler={onDurationSelect} />
      </span>

      <Link to={'/overview'}>{t('Virtualization dashboard')}</Link>
    </div>
  );
};

export default TimeRange;
