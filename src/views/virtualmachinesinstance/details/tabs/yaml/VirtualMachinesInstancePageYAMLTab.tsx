import React, { FC, Suspense } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
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
    <Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      {obj?.metadata && <ResourceYAMLEditor initialResource={obj} />}
    </Suspense>
  );
};

export default VirtualMachinesInstancePageYAMLTab;
