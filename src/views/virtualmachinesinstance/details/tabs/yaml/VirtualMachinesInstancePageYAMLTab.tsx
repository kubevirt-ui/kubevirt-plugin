import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type VirtualMachinesInstancePageYAMLTabProps = {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageYAMLTab: FC<VirtualMachinesInstancePageYAMLTabProps> = ({
  obj,
}) => {
  return (
    <React.Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      {obj?.metadata && <ResourceYAMLEditor initialResource={obj} />}
    </React.Suspense>
  );
};

export default VirtualMachinesInstancePageYAMLTab;
