import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const getVMStatus = (vm: V1VirtualMachine) => vm?.status?.printableStatus;
