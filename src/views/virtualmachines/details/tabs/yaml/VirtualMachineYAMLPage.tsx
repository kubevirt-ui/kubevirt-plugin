import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type VirtualMachineYAMLPageProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj?: V1VirtualMachine;
};

const VirtualMachineYAMLPage: React.FC<VirtualMachineYAMLPageProps> = ({ obj: vm }) => {
  const loading = (
    <Bullseye>
      <Loading />
    </Bullseye>
  );
  return !vm ? (
    loading
  ) : (
    <React.Suspense fallback={loading}>
      <ResourceYAMLEditor initialResource={vm} />
    </React.Suspense>
  );
};

export default VirtualMachineYAMLPage;
