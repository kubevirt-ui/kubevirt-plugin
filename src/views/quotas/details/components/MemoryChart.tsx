import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartThemeColor } from '@patternfly/react-charts/victory';

import { QUOTA_UNITS } from '../../utils/constants';
import { UtilChartProps } from '../types';

import StatusChart from './StatusChart';

const MemoryChart: React.FC<UtilChartProps> = ({ fieldKey, hard, used }) => {
  const { t } = useKubevirtTranslation();

  const memoryLimit = parseInt(hard[fieldKey]);
  const memoryUsed = parseInt(used[fieldKey]);
  const unit = QUOTA_UNITS.memory;

  return (
    <StatusChart
      cardTitle={t('Memory limits')}
      chartValue={`${memoryUsed} ${unit}`}
      color={ChartThemeColor.orange}
      limit={memoryLimit}
      tooltipText={t('Memory used')}
      unit={unit}
      used={memoryUsed}
    />
  );
};

export default MemoryChart;
