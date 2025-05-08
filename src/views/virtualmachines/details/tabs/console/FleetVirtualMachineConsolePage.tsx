import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { Bullseye } from '@patternfly/react-core';
import { Fleet, FleetSupport, ResourceTabComponent } from '@stolostron/multicluster-sdk';

import VirtualMachineConsolePage from './VirtualMachineConsolePage';

const FleetVirtualMachineConsolePage: ResourceTabComponent = ({ resource }) => {
  const vm = resource as Fleet<V1VirtualMachine>;
  return (
    <FleetSupport
      loading={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      <VirtualMachineConsolePage obj={vm} />
    </FleetSupport>
  );
};

export default FleetVirtualMachineConsolePage;
