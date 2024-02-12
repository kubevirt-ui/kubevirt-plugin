import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceEventStream } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type VirtualMachinesInstancePageEventsTabProps = {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageEventsTab: FC<VirtualMachinesInstancePageEventsTabProps> = ({
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
