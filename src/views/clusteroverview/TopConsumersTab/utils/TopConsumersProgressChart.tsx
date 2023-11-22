import * as React from 'react';

import { Progress, ProgressMeasureLocation, ProgressSize } from '@patternfly/react-core';

import './TopConsumersProgressChart.scss';

type TopConsumersProgressChartProps = {
  labelUnit: string;
  labelValue: number;
  maxValue: number;
  title: string;
  value: number;
};

const TopConsumersProgressChart: React.FC<TopConsumersProgressChartProps> = ({
  labelUnit,
  labelValue,
  maxValue,
  title,
  value,
}) => (
  <>
    <div className="kv-top-consumers-card__progress-chart--title">{title}</div>
    <Progress
      aria-label="kv-top-consumers-card-chart"
      label={`${labelValue} ${labelUnit}`}
      max={maxValue}
      measureLocation={ProgressMeasureLocation.outside}
      size={ProgressSize.sm}
      value={value}
    />
  </>
);

export default TopConsumersProgressChart;
