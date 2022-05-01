import React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceEventStream } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type VirtualMachinePageEventsTabProps = RouteComponentProps & {
  obj: V1VirtualMachine;
};

const VirtualMachinePageEventsTab: React.FC<VirtualMachinePageEventsTabProps> = ({ obj: vm }) => {
  return (
    <React.Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      {vm?.metadata && <ResourceEventStream resource={vm} />}
    </React.Suspense>
  );
};

export default VirtualMachinePageEventsTab;
