import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type VMNodeData = {
  kind: string;
  osImage: string;
  vmi: V1VirtualMachineInstance;
  vmStatus: string;
};
