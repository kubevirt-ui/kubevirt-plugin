import React, { FC, useMemo } from 'react';

import SubTitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/SubTitleChartLabel';
import TitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/TitleChartLabel';
import { AlertsByHealthImpact } from '@kubevirt-utils/hooks/useInfrastructureAlerts/useInfrastructureAlerts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ChartDonut } from '@patternfly/react-charts/victory';

import { alertTypeToColorMap } from '../utils/utils';

import EmptyStateNoAlerts from './EmptyStateNoAlerts';

type HealthPopupChartProps = {
  alerts: AlertsByHealthImpact;
  numberOfAlerts?: number;
};

const HealthPopupChart: FC<HealthPopupChartProps> = ({ alerts, numberOfAlerts }) => {
  const { t } = useKubevirtTranslation();
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

  if (isEmpty(numberOfAlerts))
    return <EmptyStateNoAlerts classname="kv-health-popup__empty-state--no-alerts" />;

  return (
    <div className="kv-health-popup__chart">
      <ChartDonut
        style={{
          data: {
            fill: ({ datum }) => datum?.fill,
          },
        }}
        ariaDesc={t('Virtualization Alerts')}
        ariaTitle={t('Virtualization Alerts donut chart')}
        data={chartData}
        height={150}
        labels={({ datum }) => `${datum?.x}: ${datum?.y}%`}
        subTitle={t('Alerts')}
        subTitleComponent={<SubTitleChartLabel />}
        title={totalNumberAlerts?.toString()}
        titleComponent={<TitleChartLabel />}
        width={150}
      />
    </div>
  );
};

export default HealthPopupChart;
