import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type ConfigurationInnerTabProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  vm?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};
