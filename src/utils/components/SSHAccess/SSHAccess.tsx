import React, { FC } from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DescriptionList } from '@patternfly/react-core';

import ConsoleOverVirtctl from './components/ConsoleOverVirtctl';
import SSHCommand from './components/SSHCommand';

type SSHAccessProps = {
  isCustomizeInstanceType?: boolean;
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded?: boolean;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const SSHAccess: FC<SSHAccessProps> = ({
  isCustomizeInstanceType,
  sshService,
  sshServiceLoaded,
  vm,
  vmi,
}) => {
  return (
    <DescriptionList className="pf-c-description-list">
      {!isCustomizeInstanceType && (
        <SSHCommand sshService={sshService} sshServiceLoaded={sshServiceLoaded} vm={vm} vmi={vmi} />
      )}
      <ConsoleOverVirtctl vm={vm} />
    </DescriptionList>
  );
};

export default SSHAccess;
