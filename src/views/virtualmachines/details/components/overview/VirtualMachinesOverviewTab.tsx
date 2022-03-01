import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Grid, GridItem } from '@patternfly/react-core';

import VirtualMachinesOverviewTabAlerts from './components/VirtualMachinesOverviewTabAlerts/VirtualMachinesOverviewTabAlerts';
import VirtualMachinesOverviewTabDetails from './components/VirtualMachinesOverviewTabDetails/VirtualMachinesOverviewTabDetails';
import VirtualMachinesOverviewTabDisks from './components/VirtualMachinesOverviewTabDisks/VirtualMachinesOverviewTabDisks';
import VirtualMachinesOverviewTabHardwareDevices from './components/VirtualMachinesOverviewTabHardwareDevices/VirtualMachinesOverviewTabHardwareDevices';
import VirtualMachinesOverviewTabNetworkInterfaces from './components/VirtualMachinesOverviewTabNetworkInterfaces/VirtualMachinesOverviewTabNetworkInterfaces';
import VirtualMachinesOverviewTabSnapshots from './components/VirtualMachinesOverviewTabSnapshots/VirtualMachinesOverviewTabSnapshots';
import VirtualMachinesOverviewTabUtilization from './components/VirtualMachinesOverviewTabUtilization/VirtualMachinesOverviewTabUtilization';

type VirtualMachinesOverviewTabProps = RouteComponentProps & {
  obj: V1VirtualMachine;
};

const VirtualMachinesOverviewTab: React.FC<VirtualMachinesOverviewTabProps> = () => {
  return (
    <Grid hasGutter>
      {/* remove style */}
      <GridItem span={8} style={{ textAlign: 'center' }}>
        <Grid hasGutter>
          <GridItem>
            <VirtualMachinesOverviewTabDetails />
          </GridItem>
          <GridItem>
            <VirtualMachinesOverviewTabUtilization />
          </GridItem>
          <GridItem>
            <VirtualMachinesOverviewTabHardwareDevices />
          </GridItem>
        </Grid>
      </GridItem>
      {/* remove style */}
      <GridItem span={4} style={{ textAlign: 'center' }}>
        <Grid hasGutter>
          <GridItem>
            <VirtualMachinesOverviewTabAlerts />
          </GridItem>
          <GridItem>
            <VirtualMachinesOverviewTabSnapshots />
          </GridItem>
          <GridItem>
            <VirtualMachinesOverviewTabNetworkInterfaces />
          </GridItem>
          <GridItem>
            <VirtualMachinesOverviewTabDisks />
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
  );
};

export default VirtualMachinesOverviewTab;
