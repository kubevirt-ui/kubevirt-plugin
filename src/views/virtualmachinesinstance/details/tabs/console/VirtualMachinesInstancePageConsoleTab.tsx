import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';

import VncConsole from './components/vnc-console/VncConsole';
import { INSECURE, SECURE } from './utils/VirtualMachinesInstancePageConsoleTabConsts';
import { isConnectionEncrypted } from './utils/VirtualMachinesInstancePageConsoleTabUtils';

const VirtualMachinesInstancePageConsoleTab: React.FC<
  VirtualMachinesInstancePageConsoleTabProps
> = ({ obj: vmi }) => {
  const isEncrypted = isConnectionEncrypted();

  return !vmi?.metadata ? (
    <Loading />
  ) : (
    <VncConsole
      encrypt={isEncrypted}
      host={window.location.hostname}
      port={window.location.port || (isEncrypted ? SECURE : INSECURE)}
      path={`api/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${vmi?.metadata?.namespace}/virtualmachineinstances/${vmi?.metadata?.name}/vnc`}
    />
  );
};

type VirtualMachinesInstancePageConsoleTabProps = RouteComponentProps & {
  obj: V1VirtualMachineInstance;
};

export default VirtualMachinesInstancePageConsoleTab;
