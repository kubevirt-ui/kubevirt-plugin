import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Skeleton } from '@patternfly/react-core';

import './UtilizationBar.scss';

type UtilizationBarProps = {
  isLoading?: boolean;
  percentage: number;
  title: string;
};

const UtilizationBar: FC<UtilizationBarProps> = ({ isLoading, percentage, title }) => {
  const { t } = useKubevirtTranslation();
  const safePercentage = Number.isFinite(percentage) ? percentage : 0;
  const clampedPercentage = Math.min(100, Math.max(0, safePercentage));

  return (
    <div aria-label={title} className="utilization-bar" role="group">
      <div className="utilization-bar__header">
        <span className="utilization-bar__title">{title}</span>
        <span className="utilization-bar__percentage">
          {isLoading ? <Skeleton width="30px" /> : `${clampedPercentage}%`}
        </span>
      </div>
      <div
        aria-busy={isLoading}
        aria-label={t('{{title}}: {{percentage}}%', { percentage: clampedPercentage, title })}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={isLoading ? undefined : clampedPercentage}
        className="utilization-bar__track"
        role="progressbar"
      >
        {isLoading ? (
          <Skeleton height="8px" width="100%" />
        ) : (
          <div className="utilization-bar__fill" style={{ width: `${clampedPercentage}%` }} />
        )}
      </div>
    </div>
  );
};

export default UtilizationBar;
