import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';

const AGENT_CONNECTED = 'AgentConnected';

const hasAgentConnectedCondition = (conditions?: { status?: string; type?: string }[]): boolean =>
  conditions?.some((c) => c?.type === AGENT_CONNECTED && c?.status === 'True') ?? false;

export const isGuestAgentConnected = (vmi: V1VirtualMachineInstance): boolean =>
  hasAgentConnectedCondition(vmi?.status?.conditions);

/**
 * Check whether the guest agent is connected by looking at the VM's own conditions.
 * VM conditions are always complete, unlike VMI conditions which may be
 * incomplete when fetched from spoke clusters via the multicluster SDK.
 * @param vm - the virtual machine to check
 */
export const isVMGuestAgentConnected = (vm: V1VirtualMachine): boolean =>
  hasAgentConnectedCondition(vm?.status?.conditions);

export const getOSNameFromGuestAgent = (
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo,
): string => {
  const name = guestAgentData?.os?.name ?? '';
  const version = guestAgentData?.os?.version ?? '';

  if (name.includes('Windows') && version.includes('Windows')) {
    return version;
  }
  return `${name} ${version}`.trim();
};

/**
 * Count running VMs without a connected guest agent.
 * Reads AgentConnected from vm.status.conditions, which is reliable
 * across single-cluster and multicluster (hub-spoke) setups.
 * @param vms - list of virtual machines
 */
export const countVMsWithoutGuestAgent = (vms: V1VirtualMachine[]): number => {
  const vmsWithoutAgent = vms.filter(
    (vm) => getVMStatus(vm) === VM_STATUS.Running && !isVMGuestAgentConnected(vm),
  );
  return vmsWithoutAgent.length;
};
