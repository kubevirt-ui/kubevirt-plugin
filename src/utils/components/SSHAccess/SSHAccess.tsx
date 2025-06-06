import React, { FC } from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DescriptionList } from '@patternfly/react-core';

import ConsoleOverVirtctl from './components/ConsoleOverVirtctl';
import SSHCommand from './components/SSHCommand';

type SSHAccessProps = {
  isCustomizeInstanceType?: boolean;
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded?: boolean;
  vm: V1VirtualMachine;
};

const SSHAccess: FC<SSHAccessProps> = ({
  isCustomizeInstanceType,
  sshService,
  sshServiceLoaded,
  vm,
}) => {
  return (
    <DescriptionList>
      {!isCustomizeInstanceType && (
        <SSHCommand sshService={sshService} sshServiceLoaded={sshServiceLoaded} vm={vm} />
      )}
      <ConsoleOverVirtctl vm={vm} />
    </DescriptionList>
  );
};

export default SSHAccess;
