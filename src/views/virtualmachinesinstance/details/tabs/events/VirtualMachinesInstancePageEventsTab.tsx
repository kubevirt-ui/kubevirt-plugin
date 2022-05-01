import React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ResourceEventStream } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';
import Loading from '@kubevirt-utils/components/Loading/Loading';

type VirtualMachinesInstancePageEventsTabProps = RouteComponentProps & {
  obj: V1VirtualMachineInstance;
};
const VirtualMachinesInstancePageEventsTab: React.FC<VirtualMachinesInstancePageEventsTabProps> = ({
  obj: vmi,
}) => {
  return (
    <React.Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      {vmi?.metadata && <ResourceEventStream resource={vmi} />}
    </React.Suspense>
  );
};

export default VirtualMachinesInstancePageEventsTab;
