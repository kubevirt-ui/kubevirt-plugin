import type { FC } from 'react';

import type { ChartLabelProps } from '@patternfly/react-charts/victory';
import { ChartLabel } from '@patternfly/react-charts/victory';

const SubTitleChartLabel: FC<ChartLabelProps & { splitTitleText?: boolean }> = (props) => (
  <ChartLabel
    {...props}
    style={{ fill: 'var(--pf-t--chart--global--fill--color--400)', fontSize: 14 }}
    text={
      props.splitTitleText && props.text && typeof props.text === 'string'
        ? props.text?.split(' ')
        : props.text
    }
  />
);

export default SubTitleChartLabel;
