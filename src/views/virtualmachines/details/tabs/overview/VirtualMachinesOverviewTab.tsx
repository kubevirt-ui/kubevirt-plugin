import React, { FC } from 'react';

import AlertsCard from '@kubevirt-utils/components/AlertsCard/AlertsCard';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { useGuestOS } from '@kubevirt-utils/resources/vmi';
import { Grid, GridItem, PageSection } from '@patternfly/react-core';
import { useIsFleetSupported } from '@stolostron/multicluster-sdk';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import VirtualMachinesOverviewTabActiveUser from './components/VirtualMachinesOverviewTabActiveUser/VirtualMachinesOverviewTabActiveUser';
import VirtualMachinesOverviewTabDetails from './components/VirtualMachinesOverviewTabDetails/VirtualMachinesOverviewTabDetails';
import VirtualMachinesOverviewTabDisks from './components/VirtualMachinesOverviewTabDisks/VirtualMachinesOverviewTabDisks';
import VirtualMachinesOverviewTabFilesystem from './components/VirtualMachinesOverviewTabFilesystem/VirtualMachinesOverviewTabFilesystem';
import VirtualMachinesOverviewTabGeneral from './components/VirtualMachinesOverviewTabGeneral/VirtualMachinesOverviewTabGeneral';
import VirtualMachinesOverviewTabHardwareDevices from './components/VirtualMachinesOverviewTabHardwareDevices/VirtualMachinesOverviewTabHardwareDevices';
import VirtualMachinesOverviewTabNetworkInterfaces from './components/VirtualMachinesOverviewTabNetworkInterfaces/VirtualMachinesOverviewTabNetworkInterfaces';
import VirtualMachinesOverviewTabService from './components/VirtualMachinesOverviewTabService/VirtualMachinesOverviewTabService';
import VirtualMachinesOverviewTabSnapshots from './components/VirtualMachinesOverviewTabSnapshots/VirtualMachinesOverviewTabSnapshots';
import VirtualMachinesOverviewTabUtilization from './components/VirtualMachinesOverviewTabUtilization/VirtualMachinesOverviewTabUtilization';
import useVMAlerts from './utils/hook/useVMAlerts';

const VirtualMachinesOverviewTab: FC<NavPageComponentProps> = ({
  instanceTypeExpandedSpec,
  obj: vm,
}) => {
  const vmAlerts = useVMAlerts(vm);
  const { error, loaded, pods, vmi } = useVMIAndPodsForVM(
    vm?.metadata?.name,
    vm?.metadata?.namespace,
    vm.cluster,
  );
  const [guestAgentData, guestAgentDataLoaded, guestAgentDataLoadError] = useGuestOS(vmi);
  const isFleetSupported = useIsFleetSupported();

  return (
    <PageSection>
      <Grid hasGutter>
        <GridItem span={8}>
          <Grid hasGutter>
            <GridItem>
              <VirtualMachinesOverviewTabDetails
                error={error}
                guestAgentData={guestAgentData}
                guestAgentDataLoaded={guestAgentDataLoaded}
                instanceTypeExpandedSpec={instanceTypeExpandedSpec}
                loaded={loaded}
                vm={vm}
                vmi={vmi}
              />
            </GridItem>
            {!isFleetSupported && (
              <GridItem>
                <VirtualMachinesOverviewTabUtilization pods={pods} vm={vm} vmi={vmi} />
              </GridItem>
            )}
          </Grid>
        </GridItem>
        <GridItem span={4}>
          <Grid hasGutter>
            {!isFleetSupported && (
              <GridItem>
                <AlertsCard sortedAlerts={vmAlerts} />
              </GridItem>
            )}

            <GridItem>
              <VirtualMachinesOverviewTabGeneral pods={pods} vm={vm} vmi={vmi} />
            </GridItem>
            <GridItem>
              <VirtualMachinesOverviewTabSnapshots vm={vm} />
            </GridItem>
            <GridItem>
              <VirtualMachinesOverviewTabNetworkInterfaces vm={vm} vmi={vmi} />
            </GridItem>
            <GridItem>
              <VirtualMachinesOverviewTabDisks vm={vm} vmi={vmi} />
            </GridItem>
          </Grid>
        </GridItem>
        <VirtualMachinesOverviewTabHardwareDevices vm={vm} />
        <VirtualMachinesOverviewTabFilesystem
          guestAgentData={guestAgentData}
          guestAgentDataLoaded={guestAgentDataLoaded}
          vm={vm}
        />
        <VirtualMachinesOverviewTabService vm={vm} />
        <VirtualMachinesOverviewTabActiveUser
          guestAgentData={guestAgentData}
          guestAgentDataLoaded={guestAgentDataLoaded}
          guestAgentDataLoadError={guestAgentDataLoadError}
          vmi={vmi}
        />
      </Grid>
    </PageSection>
  );
};

export default VirtualMachinesOverviewTab;
