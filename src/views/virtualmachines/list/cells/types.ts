import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { VMCallbacks } from '../virtualMachinesDefinition';

export type VMCellProps = {
  row: V1VirtualMachine;
};

export type VMCellWithCallbacksProps = VMCellProps & {
  callbacks: VMCallbacks;
};
