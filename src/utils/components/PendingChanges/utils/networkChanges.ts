import {
  type V1Interface,
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { interfaceModelType } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/constants';
import { getInterfaces } from '@kubevirt-utils/resources/vm';
import { getNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { getInterfacesAndNetworks } from '@kubevirt-utils/resources/vm/utils/network/utils';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getVMIInterfaces } from '@kubevirt-utils/resources/vmi/utils/selectors';
import {
  isInterfaceEphemeral,
  isPendingNICAdd,
  isPendingNICRemoval,
} from '@virtualmachines/details/tabs/configuration/network/utils/utils';

export const getDefaultInterfaceModel = (vmi: V1VirtualMachineInstance): string => {
  return isWindows(vmi) ? interfaceModelType.E1000E : interfaceModelType.VIRTIO;
};

export const getInterfaceByName = (
  name: string,
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): V1Interface =>
  getInterfaces(vm)?.find((iface) => iface?.name === name) ??
  getVMIInterfaces(vmi)?.find((iface) => iface?.name === name);

export const getChangedNICs = (vm: V1VirtualMachine, vmi: V1VirtualMachineInstance): string[] => {
  const realNICs = getInterfacesAndNetworks(vm, vmi).filter(
    (state) => !isInterfaceEphemeral(state.runtime?.network, state.runtime?.status),
  );
  const pending = realNICs
    .map((state) => state?.runtime?.network?.name ?? state?.config?.network?.name)
    .filter(Boolean)
    .filter(
      (networkName) =>
        isPendingNICAdd(vm, vmi, networkName) || isPendingNICRemoval(vm, vmi, networkName),
    );
  const updated = realNICs
    // NIC must exist in both VM and VMI in a valid update scenario
    // this handles also autoattachPodInterface = true (no config in the VM)
    .filter((state) => state.config && state?.runtime?.network)
    // add/removal are handled separately
    .filter((state) => !pending.includes(state.runtime?.network?.name))
    .filter(
      (state) =>
        // NAD changed
        state.config.network?.multus?.networkName !== state.runtime.network?.multus?.networkName ||
        // type change covers binding change (l2bridge <-> passt)
        getNetworkInterfaceType(state.config.iface) !==
          getNetworkInterfaceType(state.runtime.iface) ||
        // model change (virtio <-> e1000e)
        (state.config.iface?.model &&
          state.config.iface?.model !==
            (state.runtime.iface?.model ?? getDefaultInterfaceModel(vmi))) ||
        // boot order changed
        state.config.iface?.bootOrder !== state.runtime.iface?.bootOrder,
    )
    .map((state) => state.runtime?.network?.name);

  return Array.from(new Set([...pending, ...updated]));
};
