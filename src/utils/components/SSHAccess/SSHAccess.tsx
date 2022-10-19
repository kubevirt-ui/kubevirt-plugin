import * as React from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DescriptionList } from '@patternfly/react-core';

import ConsoleOverVirtctl from './components/ConsoleOverVirtctl';
import SSHCommand from './components/SSHCommand';

type SSHAccessProps = {
  sshService: IoK8sApiCoreV1Service;
  vmi: V1VirtualMachineInstance;
  vm: V1VirtualMachine;
  sshServiceLoaded?: boolean;
};

const SSHAccess: React.FC<SSHAccessProps> = ({ sshService, sshServiceLoaded, vmi, vm }) => {
  return (
    <DescriptionList>
      <ConsoleOverVirtctl vmName={vm?.metadata?.name} vmNamespace={vm?.metadata?.namespace} />
      <SSHCommand vmi={vmi} vm={vm} sshService={sshService} sshServiceLoaded={sshServiceLoaded} />
    </DescriptionList>
  );
};

export default SSHAccess;
