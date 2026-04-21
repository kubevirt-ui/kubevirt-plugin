import React, { FC } from 'react';

import { Grid, GridItem, Stack } from '@patternfly/react-core';
import ReviewGridLeftColumn from '@virtualmachines/creation-wizard/steps/ReviewAndCreateStep/components/ReviewGrid/components/ReviewGridLeftColumn';

import ReviewGridRightColumn from './components/ReviewGridRightColumn/ReviewGridRightColumn';

const ReviewGrid: FC = () => {
  return (
    <Stack hasGutter>
      <Grid hasGutter>
        <GridItem span={5}>
          <ReviewGridLeftColumn />
        </GridItem>
        <GridItem span={1} />
        <GridItem span={6}>
          <ReviewGridRightColumn />
        </GridItem>
      </Grid>
    </Stack>
  );
};

export default ReviewGrid;
