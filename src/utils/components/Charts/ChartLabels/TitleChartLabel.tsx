import React, { FC } from 'react';

import { ChartLabel, ChartLabelProps } from '@patternfly/react-charts/victory';

const TitleChartLabel: FC<ChartLabelProps> = (props) => (
  <ChartLabel
    {...props}
    style={{ fill: 'var(--pf-t--chart--global--fill--color--900)', fontSize: 24 }}
  />
);

export default TitleChartLabel;
