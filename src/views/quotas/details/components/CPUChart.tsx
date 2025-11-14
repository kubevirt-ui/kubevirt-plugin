import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartThemeColor } from '@patternfly/react-charts/victory';

import { QUOTA_UNITS } from '../../utils/constants';
import { UtilChartProps } from '../types';

import StatusChart from './StatusChart';

const CPUChart: React.FC<UtilChartProps> = ({ fieldKey, hard, used }) => {
  const { t } = useKubevirtTranslation();

  const cpuLimit = parseInt(hard[fieldKey]);
  const cpuUsed = parseInt(used[fieldKey]);

  return (
    <StatusChart
      cardTitle={t('vCPU limits')}
      chartValue={`${(cpuUsed / cpuLimit) * 100}%`}
      color={ChartThemeColor.blue}
      limit={cpuLimit}
      tooltipText={t('CPU utilization')}
      unit={QUOTA_UNITS.cpu}
      used={cpuUsed}
    />
  );
};

export default CPUChart;
