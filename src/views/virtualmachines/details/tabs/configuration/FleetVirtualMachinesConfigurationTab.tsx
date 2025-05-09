import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import useInstanceTypeExpandSpec from '@kubevirt-utils/resources/vm/hooks/useInstanceTypeExpandSpec';
import { Bullseye } from '@patternfly/react-core';
import { FleetSupport, ResourceTabComponent } from '@stolostron/multicluster-sdk';

import VirtualMachineConfigurationTab from './VirtualMachineConfigurationTab';

const VirtualMachineConfigurationInstanceTypeLoader: FC<{ vm: V1VirtualMachine }> = ({ vm }) => {
  const [instanceTypeExpandedSpec, expandedSpecLoading, errorExpandedSpec] =
    useInstanceTypeExpandSpec(vm);

  return (
    <StateHandler error={errorExpandedSpec} loaded={!expandedSpecLoading} withBullseye>
      <VirtualMachineConfigurationTab
        instanceTypeExpandedSpec={instanceTypeExpandedSpec}
        obj={vm}
      />
    </StateHandler>
  );
};

const FleetVirtualMachineConfigurationTab: ResourceTabComponent = ({ resource }) => {
  const vm = resource as V1VirtualMachine;
  return (
    <FleetSupport
      loading={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      <VirtualMachineConfigurationInstanceTypeLoader vm={vm} />
    </FleetSupport>
  );
};

export default FleetVirtualMachineConfigurationTab;
