import React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import DurationDropdown from '@kubevirt-utils/components/DurationOption/DurationDropdown';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVirtualizationObservabilityLink } from '@kubevirt-utils/hooks/useVirtualizationObservabilityLink/useVirtualizationObservabilityLink';
import useIsACMPage from '@multicluster/useIsACMPage';

import useDuration from '../hooks/useDuration';
import { MONITORING_LINK } from '../utils/constants';

const TimeRange: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const virtualizationObservabilityLink = useVirtualizationObservabilityLink();

  const { duration, setDuration } = useDuration();
  const onDurationSelect = (value: string) =>
    setDuration(DurationOption.fromDropdownLabel(value).toString());

  return (
    <div className="timerange--main">
      <span className="timerange--main__text">
        <span className="timerange--main__text--time-range">{t('Time range')}</span>
        <div>
          <DurationDropdown selectedDuration={duration} selectHandler={onDurationSelect} />
        </div>
      </span>

      {isACMPage && virtualizationObservabilityLink && (
        <ExternalLink href={virtualizationObservabilityLink}>
          {t('Virtualization dashboard')}
        </ExternalLink>
      )}

      {!isACMPage && <Link to={MONITORING_LINK}>{t('Virtualization dashboard')}</Link>}
    </div>
  );
};

export default TimeRange;
