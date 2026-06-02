import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getVMStatus, isStatusConditionTrue } from '@kubevirt-utils/resources/shared';
import { VirtualMachineStatusConditionTypes } from '@kubevirt-utils/resources/vm/utils/constants';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';

export const isGuestAgentConnected = (vmi: V1VirtualMachineInstance): boolean =>
  isStatusConditionTrue(vmi, VirtualMachineStatusConditionTypes.AgentConnected);

/**
 * Check whether the guest agent is connected by looking at the VM's own conditions.
 * VM conditions are always complete, unlike VMI conditions which may be
 * incomplete when fetched from spoke clusters via the multicluster SDK.
 * @param vm - the virtual machine to check
 */
export const isVMGuestAgentConnected = (vm: V1VirtualMachine): boolean =>
  isStatusConditionTrue(vm, VirtualMachineStatusConditionTypes.AgentConnected);

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
