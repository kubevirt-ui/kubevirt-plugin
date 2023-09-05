import React, { useMemo } from 'react';

import { AlertsByHealthImpact } from '@kubevirt-utils/hooks/useInfrastructureAlerts/useInfrastructureAlerts';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartDonut } from '@patternfly/react-charts';

import { alertTypeToColorMap } from '../utils/utils';

type HealthPopupChartProps = {
  alerts: AlertsByHealthImpact;
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
          fill: alertTypeToColorMap[alertType],
          x: alertType,
          y: percentage,
        });
        return acc;
      }, []),
    [alerts, totalNumberAlerts],
  );

  return (
    <div>
      <ChartDonut
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
        ariaDesc={t('Virtualization Alerts')}
        ariaTitle={t('Virtualization Alerts donut chart')}
        data={chartData}
        height={200}
        labels={({ datum }) => `${datum?.x}: ${datum?.y}%`}
        subTitle={t('Alerts')}
        title={totalNumberAlerts?.toString()}
        width={200}
      />
    </div>
  );
};

export default HealthPopupChart;
