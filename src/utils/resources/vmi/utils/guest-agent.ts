import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

export const isGuestAgentConnected = (vmi: V1VirtualMachineInstance): boolean =>
  vmi?.status?.conditions?.some(
    (condition) => condition?.type === 'AgentConnected' && condition?.status === 'True',
  );

export const getOsNameFromGuestAgent = (
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo,
): string =>
  guestAgentData?.os?.name?.includes('Windows') && guestAgentData?.os?.version?.includes('Windows')
    ? guestAgentData?.os?.version
    : `${guestAgentData?.os?.name} ${guestAgentData?.os?.version}`;
