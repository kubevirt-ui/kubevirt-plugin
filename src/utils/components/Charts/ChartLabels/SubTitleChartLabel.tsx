import type { FC } from 'react';
import React from 'react';

import type { ChartLabelProps } from '@patternfly/react-charts/victory';
import { ChartLabel } from '@patternfly/react-charts/victory';

const SubTitleChartLabel: FC<ChartLabelProps & { splitTitleText?: boolean }> = (props) => (
  <ChartLabel
    {...props}
    text={
      props.splitTitleText && props.text && typeof props.text === 'string'
        ? props.text?.split(' ')
        : props.text
    }
    style={{ fill: 'var(--pf-t--chart--global--fill--color--400)', fontSize: 14 }}
  />
);

export default SubTitleChartLabel;
