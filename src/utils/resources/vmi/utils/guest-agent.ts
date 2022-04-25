import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const isGuestAgentConnected = (vmi: V1VirtualMachineInstance): boolean =>
  vmi?.status?.conditions?.some(
    (condition) => condition?.type === 'AgentConnected' && condition?.status === 'True',
  );
