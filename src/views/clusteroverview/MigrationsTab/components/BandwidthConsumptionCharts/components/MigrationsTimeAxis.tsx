import React, { FC } from 'react';

import { tickLabels } from '@kubevirt-utils/components/Charts/ChartLabels/styleOverrides';
import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartAxis, ChartContainer } from '@patternfly/react-charts/victory';

import { formatTimestamp, getTimeTickValues } from '../utils';

type MigrationsTimeAxisProps = {
  domainX: [number, number];
  timespan: number;
};

const MigrationsTimeAxis: FC<MigrationsTimeAxisProps> = ({ domainX, timespan }) => {
  const { t } = useKubevirtTranslation();
  const { width } = useResponsiveCharts();
  return (
    <div className="co-utilization-card__item co-utilization-card__item-header">
      <div className="co-utilization-card__item-section co-u-hidden co-u-visible-on-xl">
        <span className="co-utilization-card__item-text" data-test="utilization-card-item-text">
          {t('Resource')}
        </span>
      </div>
      <div className="co-utilization-card__item-chart co-utilization-card__item-chart--times">
        <ChartAxis
          axisComponent={<></>}
          containerComponent={<ChartContainer title={t('Time axis')} />}
          domain={{ x: domainX }}
          fixLabelOverlap
          height={15}
          orientation="top"
          padding={{ bottom: 0, left: 70, right: 0, top: 30 }}
          scale={{ x: 'time' }}
          style={{ tickLabels }}
          tickFormat={(time) => formatTimestamp(timespan, time, true)}
          tickValues={getTimeTickValues(domainX)}
          width={width}
        />
      </div>
    </div>
  );
};

export default MigrationsTimeAxis;
