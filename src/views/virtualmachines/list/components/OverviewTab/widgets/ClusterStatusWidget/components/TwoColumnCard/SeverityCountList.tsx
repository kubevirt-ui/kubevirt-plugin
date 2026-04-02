import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { getItemLabel, getSeverityLabel } from '../../hooks/clusterMetricConstants';

import { SeverityCountListProps } from './types';

const SeverityCountList: FC<SeverityCountListProps> = ({ itemLabel, severityCounts }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {severityCounts
        .filter(({ count }) => count > 0)
        .map(({ count, level }) => (
          <div className="two-column-card__severity-row" key={level}>
            <span className="two-column-card__severity-count">{count}</span>
            <span className="two-column-card__severity-label">
              {getItemLabel(count, t, itemLabel)}
            </span>
            <span className="two-column-card__severity-value">{getSeverityLabel(level, t)}</span>
          </div>
        ))}
    </>
  );
};

export default SeverityCountList;
