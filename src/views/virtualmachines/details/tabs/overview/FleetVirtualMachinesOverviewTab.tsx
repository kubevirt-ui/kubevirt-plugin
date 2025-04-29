import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import useInstanceTypeExpandSpec from '@kubevirt-utils/resources/vm/hooks/useInstanceTypeExpandSpec';
import { Bullseye } from '@patternfly/react-core';
import { Fleet, FleetSupport, ResourceTabComponent } from '@stolostron/multicluster-sdk';

import VirtualMachinesOverviewTab from './VirtualMachinesOverviewTab';

const VirtualMachineOverviewInstanceTypeLoader: FC<{ vm: Fleet<V1VirtualMachine> }> = ({ vm }) => {
  const [instanceTypeExpandedSpec, expandedSpecLoading, errorExpandedSpec] =
    useInstanceTypeExpandSpec(vm);

  return (
    <StateHandler error={errorExpandedSpec} loaded={!expandedSpecLoading} withBullseye>
      <VirtualMachinesOverviewTab instanceTypeExpandedSpec={instanceTypeExpandedSpec} obj={vm} />
    </StateHandler>
  );
};

const FleetVirtualMachinesOverviewTab: ResourceTabComponent = ({ resource }) => {
  const vm = resource as Fleet<V1VirtualMachine>;
  return (
    <FleetSupport
      loading={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      <VirtualMachineOverviewInstanceTypeLoader vm={vm} />
    </FleetSupport>
  );
};

export default FleetVirtualMachinesOverviewTab;
