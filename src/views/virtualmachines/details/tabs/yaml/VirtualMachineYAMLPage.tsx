import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import './virtual-machine-yaml-page.scss';

type VirtualMachineYAMLPageProps = {
  obj?: V1VirtualMachine;
};

const VirtualMachineYAMLPage: FC<VirtualMachineYAMLPageProps> = ({ obj: vm }) => {
  const loading = (
    <Bullseye>
      <Loading />
    </Bullseye>
  );
  return !vm ? (
    loading
  ) : (
    <React.Suspense fallback={loading}>
      <div className="VirtualMachineYAML--main">
        <ResourceYAMLEditor initialResource={vm} />
      </div>
    </React.Suspense>
  );
};

export default VirtualMachineYAMLPage;
