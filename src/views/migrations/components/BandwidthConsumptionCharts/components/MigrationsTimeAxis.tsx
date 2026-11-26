import { type FC } from 'react';

import { tickLabels } from '@kubevirt-utils/components/Charts/ChartLabels/styleOverrides';
import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartAxis, ChartContainer } from '@patternfly/react-charts/victory';

import { MIGRATIONS_CHART_Y_AXIS_GUTTER } from '../constants';
import { formatTimestamp, getTimeTickValues } from '../utils';

type MigrationsTimeAxisProps = {
  chartWidth?: number;
  domainX: [number, number];
  timespan: number;
};

const MigrationsTimeAxis: FC<MigrationsTimeAxisProps> = ({ chartWidth, domainX, timespan }) => {
  const { t } = useKubevirtTranslation();
  const { width: responsiveWidth } = useResponsiveCharts();
  const width = chartWidth ?? responsiveWidth;
  return (
    <div className="migrations-bandwidth-charts__time-axis">
      <ChartAxis
        axisComponent={<></>}
        containerComponent={<ChartContainer title={t('Time axis')} />}
        domain={{ x: domainX }}
        fixLabelOverlap
        height={15}
        orientation="top"
        padding={{ bottom: 0, left: MIGRATIONS_CHART_Y_AXIS_GUTTER, right: 4, top: 12 }}
        scale={{ x: 'time' }}
        style={{ tickLabels }}
        tickFormat={(time) => formatTimestamp(timespan, time, true)}
        tickValues={getTimeTickValues(domainX)}
        width={width}
      />
    </div>
  );
};

export default MigrationsTimeAxis;
