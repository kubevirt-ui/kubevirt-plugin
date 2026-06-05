import React, { FC } from 'react';
import { Link } from 'react-router';

import DurationDropdown from '@kubevirt-utils/components/DurationOption/DurationDropdown';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { logExternalMonitoringNavigation } from '@kubevirt-utils/extensions/telemetry/dashboard';
import {
  TELEMETRY_EXTERNAL_MONITORING_TOOL,
  TELEMETRY_VM_DETAIL_TAB,
} from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVirtualizationObservabilityLink } from '@kubevirt-utils/hooks/useVirtualizationObservabilityLink/useVirtualizationObservabilityLink';
import useIsACMPage from '@multicluster/useIsACMPage';

import useDuration from '../hooks/useDuration';
import { MONITORING_LINK } from '../utils/constants';

const TimeRange: FC = () => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const isAdmin = useIsAdmin();
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
        <ExternalLink
          onClick={() =>
            logExternalMonitoringNavigation(
              TELEMETRY_EXTERNAL_MONITORING_TOOL.GRAFANA,
              TELEMETRY_VM_DETAIL_TAB.METRICS,
            )
          }
          href={virtualizationObservabilityLink}
        >
          {t('Virtualization dashboard')}
        </ExternalLink>
      )}

      {!isACMPage && isAdmin && (
        <Link
          onClick={() =>
            logExternalMonitoringNavigation(
              TELEMETRY_EXTERNAL_MONITORING_TOOL.PROMETHEUS,
              TELEMETRY_VM_DETAIL_TAB.METRICS,
            )
          }
          to={MONITORING_LINK}
        >
          {t('Virtualization dashboard')}
        </Link>
      )}
    </div>
  );
};

export default TimeRange;
