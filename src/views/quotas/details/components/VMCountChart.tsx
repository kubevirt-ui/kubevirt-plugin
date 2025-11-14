import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartThemeColor } from '@patternfly/react-charts/victory';

import { UtilChartProps } from '../types';

import StatusChart from './StatusChart';

const VMCountChart: React.FC<UtilChartProps> = ({ fieldKey, hard, used }) => {
  const { t } = useKubevirtTranslation();

  const vmCountLimit = parseInt(hard[fieldKey]);
  const vmCountUsed = parseInt(used[fieldKey]);

  return (
    <StatusChart
      cardTitle={t('VM limits')}
      chartValue={`${vmCountUsed}`}
      color={ChartThemeColor.purple}
      limit={vmCountLimit}
      tooltipText={t('Number of VMs')}
      unit={t('VMs')}
      used={vmCountUsed}
    />
  );
};

export default VMCountChart;
