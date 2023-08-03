import React, { FC } from 'react';

import { UseInstanceTypeAndPreferencesValues } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { Grid, GridItem } from '@patternfly/react-core';

import DetailsLeftGrid from './components/DetailsLeftGrid';
import DetailsRightGrid from './components/DetailsRightGrid';

import './VMDetailsSection.scss';

type DetailsLeftGridProps = {
  instanceTypesAndPreferencesData: UseInstanceTypeAndPreferencesValues;
};

const VMDetailsSection: FC<DetailsLeftGridProps> = ({ instanceTypesAndPreferencesData }) => {
  return (
    <div className="instancetypes-vm-details-section instancetypes-vm-details-body">
      <Grid hasGutter>
        <GridItem span={5}>
          <DetailsLeftGrid instanceTypesAndPreferencesData={instanceTypesAndPreferencesData} />
        </GridItem>
        <GridItem span={1}>{/* Spacer */}</GridItem>
        <GridItem span={5}>
          <DetailsRightGrid />
        </GridItem>
      </Grid>
    </div>
  );
};

export default VMDetailsSection;
