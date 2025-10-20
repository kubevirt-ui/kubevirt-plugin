import React from 'react';
import xbytes from 'xbytes';

import { Grid, GridItem } from '@patternfly/react-core';

type NetworkMetricsRowProps = {
  label: string;
  value: number;
};

const NetworkMetricsRow: React.FC<NetworkMetricsRowProps> = ({ label, value }) => {
  return (
    <Grid className="pf-v6-u-text-color-subtle">
      <GridItem span={6}>
        {`${xbytes(value || 0, {
          fixed: 0,
        })}s`}
      </GridItem>
      <GridItem span={6}>{label}</GridItem>
    </Grid>
  );
};

export default NetworkMetricsRow;
