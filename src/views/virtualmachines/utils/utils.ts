import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { printableVMStatus } from './virtualMachineStatuses';

export const isLiveMigratable = (vm: V1VirtualMachine, isSingleNodeCluster: boolean): boolean =>
  !isSingleNodeCluster &&
  vm?.status?.printableStatus === printableVMStatus.Running &&
  !!vm?.status?.conditions?.find(
    ({ type, status }) => type === 'LiveMigratable' && status === 'True',
  );
