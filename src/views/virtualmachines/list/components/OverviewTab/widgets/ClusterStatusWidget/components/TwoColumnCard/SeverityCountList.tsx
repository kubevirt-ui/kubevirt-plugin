import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { getItemLabel, getSeverityLabel } from '../../hooks/clusterMetricConstants';

import { SeverityCountListProps } from './types';

import './TwoColumnCard.scss';

const SeverityCountList: FCC<SeverityCountListProps> = ({ itemLabel, severityCounts }) => {
  const { t } = useKubevirtTranslation();

  const rows = severityCounts
    .filter(({ count }) => count > 0)
    .map(({ count, level }) => (
      <div className="two-column-card__severity-row" key={level}>
        <span className="two-column-card__severity-count">{count}</span>
        <span className="two-column-card__severity-label">{getItemLabel(count, t, itemLabel)}</span>
        <span className="two-column-card__severity-value">{getSeverityLabel(level, t)}</span>
      </div>
    ));

  return <div className="two-column-card__severity-list">{rows}</div>;
};

export default SeverityCountList;
