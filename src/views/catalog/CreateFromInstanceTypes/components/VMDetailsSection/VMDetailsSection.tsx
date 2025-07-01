import React, { FC } from 'react';

import { Grid, GridItem } from '@patternfly/react-core';

import DetailsLeftGrid, { DetailsLeftGridProps } from './components/DetailsLeftGrid';
import DetailsRightGrid from './components/DetailsRightGrid';

import './VMDetailsSection.scss';

const VMDetailsSection: FC<DetailsLeftGridProps> = (props) => {
  return (
    <div className="instancetypes-vm-details-section instancetypes-vm-details-body">
      <Grid hasGutter>
        <GridItem span={5}>
          <DetailsLeftGrid {...props} />
        </GridItem>
        <GridItem span={1}>{/* Spacer */}</GridItem>
        <GridItem span={6}>
          <DetailsRightGrid />
        </GridItem>
      </Grid>
    </div>
  );
};

export default VMDetailsSection;
