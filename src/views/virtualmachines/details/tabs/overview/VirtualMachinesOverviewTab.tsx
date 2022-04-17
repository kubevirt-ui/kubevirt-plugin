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

const VirtualMachinesOverviewTab: React.FC<VirtualMachinesOverviewTabProps> = ({ obj: vm }) => {
  return (
    <Grid hasGutter className="co-dashboard-body">
      <GridItem span={8}>
        <Grid hasGutter>
          <GridItem>
            <VirtualMachinesOverviewTabDetails vm={vm} />
          </GridItem>
          <GridItem>
            <VirtualMachinesOverviewTabUtilization />
          </GridItem>
          <GridItem>
            <VirtualMachinesOverviewTabHardwareDevices vm={vm} />
          </GridItem>
        </Grid>
      </GridItem>
      <GridItem span={4}>
        <Grid hasGutter>
          <GridItem>
            <VirtualMachinesOverviewTabAlerts />
          </GridItem>
          <GridItem>
            <VirtualMachinesOverviewTabSnapshots vm={vm} />
          </GridItem>
          <GridItem>
            <VirtualMachinesOverviewTabNetworkInterfaces vm={vm} />
          </GridItem>
          <GridItem>
            <VirtualMachinesOverviewTabDisks vm={vm} />
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
  );
};

export default VirtualMachinesOverviewTab;
