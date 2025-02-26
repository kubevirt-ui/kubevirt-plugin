import React, { FC } from 'react';

import { ChartLabel, ChartLabelProps } from '@patternfly/react-charts/victory';

const SubTitleChartLabel: FC<ChartLabelProps> = (props) => (
  <ChartLabel {...props} style={{ fill: 'var(--pf-v5-global--Color--400)', fontSize: 14 }} />
);

export default SubTitleChartLabel;
