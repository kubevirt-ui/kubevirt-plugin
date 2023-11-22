import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import AlertsCard from '@kubevirt-utils/components/AlertsCard/AlertsCard';
import { Grid, GridItem } from '@patternfly/react-core';

import VirtualMachinesOverviewTabDetails from './components/VirtualMachinesOverviewTabDetails/VirtualMachinesOverviewTabDetails';
import VirtualMachinesOverviewTabDisks from './components/VirtualMachinesOverviewTabDisks/VirtualMachinesOverviewTabDisks';
import VirtualMachinesOverviewTabHardwareDevices from './components/VirtualMachinesOverviewTabHardwareDevices/VirtualMachinesOverviewTabHardwareDevices';
import VirtualMachinesOverviewTabNetworkInterfaces from './components/VirtualMachinesOverviewTabNetworkInterfaces/VirtualMachinesOverviewTabNetworkInterfaces';
import VirtualMachinesOverviewTabSnapshots from './components/VirtualMachinesOverviewTabSnapshots/VirtualMachinesOverviewTabSnapshots';
import VirtualMachinesOverviewTabUtilization from './components/VirtualMachinesOverviewTabUtilization/VirtualMachinesOverviewTabUtilization';
import useVMAlerts from './utils/hook/useVMAlerts';

type VirtualMachinesOverviewTabProps = RouteComponentProps & {
  obj: V1VirtualMachine;
};

const VirtualMachinesOverviewTab: React.FC<VirtualMachinesOverviewTabProps> = ({ obj: vm }) => {
  const vmAlerts = useVMAlerts(vm);

  return (
    <Grid className="co-dashboard-body" hasGutter>
      <GridItem span={8}>
        <Grid hasGutter>
          <GridItem>
            <VirtualMachinesOverviewTabDetails vm={vm} />
          </GridItem>
          <GridItem>
            <VirtualMachinesOverviewTabUtilization vm={vm} />
          </GridItem>
          <GridItem>
            <VirtualMachinesOverviewTabHardwareDevices vm={vm} />
          </GridItem>
        </Grid>
      </GridItem>
      <GridItem span={4}>
        <Grid hasGutter>
          <GridItem>
            <AlertsCard sortedAlerts={vmAlerts} />
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
