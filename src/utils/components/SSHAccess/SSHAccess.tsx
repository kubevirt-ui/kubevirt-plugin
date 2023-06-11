import * as React from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import { DescriptionList } from '@patternfly/react-core';

import ConsoleOverVirtctl from './components/ConsoleOverVirtctl';
import SSHCommand from './components/SSHCommand';

type SSHAccessProps = {
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded?: boolean;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const SSHAccess: React.FC<SSHAccessProps> = ({ sshService, sshServiceLoaded, vm, vmi }) => {
  const userData = getCloudInitCredentials(vm);
  const userName = userData?.users?.[0]?.name;

  return (
    <DescriptionList>
      <ConsoleOverVirtctl
        userName={userName}
        vmName={vm?.metadata?.name}
        vmNamespace={vm?.metadata?.namespace}
      />
      <SSHCommand sshService={sshService} sshServiceLoaded={sshServiceLoaded} vm={vm} vmi={vmi} />
    </DescriptionList>
  );
};

export default SSHAccess;
