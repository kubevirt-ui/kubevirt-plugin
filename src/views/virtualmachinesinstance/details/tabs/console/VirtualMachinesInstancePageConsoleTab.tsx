import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Consoles from '@kubevirt-utils/components/Consoles/Consoles';

type VirtualMachinesInstancePageConsoleTabProps = RouteComponentProps & {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageConsoleTab: React.FC<
  VirtualMachinesInstancePageConsoleTabProps
> = ({ obj: vmi }) => {
  return <Consoles vmi={vmi} />;
};

export default VirtualMachinesInstancePageConsoleTab;
