import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace, getVMStatus } from '@kubevirt-utils/resources/shared';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import { getCluster } from '@multicluster/helpers/selectors';

export const isGuestAgentConnected = (vmi: V1VirtualMachineInstance): boolean =>
  vmi?.status?.conditions?.some(
    (condition) => condition?.type === 'AgentConnected' && condition?.status === 'True',
  );

export const getOSNameFromGuestAgent = (
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo,
): string =>
  guestAgentData?.os?.name?.includes('Windows') && guestAgentData?.os?.version?.includes('Windows')
    ? guestAgentData?.os?.version
    : `${guestAgentData?.os?.name} ${guestAgentData?.os?.version}`;

/**
 * Count running VMs whose corresponding VMI does not have the AgentConnected condition.
 * @param vms - list of virtual machines
 * @param vmis - list of virtual machine instances to match against
 */
export const countVMsWithoutGuestAgent = (
  vms: V1VirtualMachine[],
  vmis: V1VirtualMachineInstance[],
): number => {
  const runningVMs = vms?.filter((vm) => getVMStatus(vm) === VM_STATUS.Running);

  const buildKey = (resource: V1VirtualMachine | V1VirtualMachineInstance): string =>
    `${getCluster(resource) ?? ''}/${getNamespace(resource)}/${getName(resource)}`;

  const vmiMap = new Map(vmis?.map((vmi) => [buildKey(vmi), vmi]) ?? []);

  const vmsWithoutAgent = runningVMs?.filter((vm) => {
    const vmi = vmiMap.get(buildKey(vm));
    return vmi && !isGuestAgentConnected(vmi);
  });

  return vmsWithoutAgent?.length || 0;
};
