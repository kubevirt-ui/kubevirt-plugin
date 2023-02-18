import React, { useMemo } from 'react';

import { SimplifiedAlerts } from '@kubevirt-utils/components/AlertsCard/utils/types';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartDonut } from '@patternfly/react-charts';

import { alertTypeToColorMap } from '../utils/utils';

type HealthPopupChartProps = {
  alerts: SimplifiedAlerts;
};

const HealthPopupChart: React.FC<HealthPopupChartProps> = ({ alerts }) => {
  const totalNumberAlerts = useMemo(
    () => Object.values(alerts)?.reduce((acc, alertType) => acc + (alertType?.length || 0), 0),
    [alerts],
  );

  const chartData = useMemo(
    () =>
      Object.keys(alerts)?.reduce((acc, alertType) => {
        const numAlertsForType: number = alerts[alertType]?.length;
        const percentage: number = Math.round((numAlertsForType / totalNumberAlerts) * 100);
        acc.push({
          x: alertType,
          y: percentage,
          fill: alertTypeToColorMap[alertType],
        });
        return acc;
      }, []),
    [alerts],
  );

  return (
    <div>
      <ChartDonut
        title={totalNumberAlerts?.toString()}
        subTitle={t('Alerts')}
        ariaDesc={t('Virtualization Alerts')}
        ariaTitle={t('Virtualization Alerts donut chart')}
        height={200}
        width={200}
        data={chartData}
        labels={({ datum }) => `${datum?.x}: ${datum?.y}%`}
        padding={{
          bottom: 0,
          left: 20,
          right: 20,
          top: -20,
        }}
        style={{
          data: {
            fill: ({ datum }) => datum?.fill,
          },
        }}
      />
    </div>
  );
};

export default HealthPopupChart;
