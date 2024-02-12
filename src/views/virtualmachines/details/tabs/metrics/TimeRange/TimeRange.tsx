import React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import DurationDropdown from '@kubevirt-utils/components/DurationOption/DurationDropdown';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import useDuration from '../hooks/useDuration';

const TimeRange: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const { duration, setDuration } = useDuration();
  const onDurationSelect = (value: string) =>
    setDuration(DurationOption.fromDropdownLabel(value).toString());

  return (
    <div className="timerange--main">
      <span className="timerange--main__text">
        <span className="timerange--main__text--time-range">{t('Time range')}</span>
        <DurationDropdown selectedDuration={duration} selectHandler={onDurationSelect} />
      </span>

      <Link to={'/monitoring/dashboards/grafana-dashboard-kubevirt-top-consumers'}>
        {t('Virtualization dashboard')}
      </Link>
    </div>
  );
};

export default TimeRange;
