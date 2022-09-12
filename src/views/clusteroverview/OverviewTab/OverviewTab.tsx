import * as React from 'react';

import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem } from '@patternfly/react-core';

import GettingStartedCard from './getting-started-card/GettingStartedCard';
import RunningVMsPerTemplateCard from './running-vms-per-template-card/RunningVMsPerTemplateCard';
import VMStatusesCard from './vm-statuses-card/VMStatusesCard';

const OverviewTab: React.FC = () => {
  return (
    <Overview>
      <GettingStartedCard />
      <Grid hasGutter>
        <GridItem span={6}>
          <VMStatusesCard />
        </GridItem>
        <GridItem span={6}>
          <RunningVMsPerTemplateCard />
        </GridItem>
      </Grid>
    </Overview>
  );
};

export default OverviewTab;
