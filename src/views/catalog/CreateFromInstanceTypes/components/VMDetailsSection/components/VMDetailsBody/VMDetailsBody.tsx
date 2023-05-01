import React, { FC } from 'react';

import { Grid, GridItem } from '@patternfly/react-core';

import DetailsLeftGrid from './components/DetailsLeftGrid';
import DetailsRightGrid from './components/DetailsRightGrid';

import './VMDetailsBody.scss';

const VMDetailsBody: FC = () => (
  <div className="instancetypes-vm-details-body">
    <Grid hasGutter>
      <GridItem span={3}>
        <DetailsLeftGrid />
      </GridItem>
      <GridItem span={1}>{/* Spacer */}</GridItem>
      <GridItem span={3}>
        <DetailsRightGrid />
      </GridItem>
    </Grid>
  </div>
);

export default VMDetailsBody;
