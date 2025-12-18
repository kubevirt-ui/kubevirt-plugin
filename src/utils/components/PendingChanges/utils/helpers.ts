import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';

import { VirtualMachineModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1Devices,
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  convertYAMLToNetworkDataObject,
  convertYAMLUserDataObject,
  getCloudInitData,
  getCloudInitVolume,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { interfaceModelType } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/constants';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { RESTART_REQUIRED } from '@kubevirt-utils/components/PendingChanges/utils/constants';
import {
  VirtualMachineConfigurationTabInner,
  VirtualMachineDetailsTab,
} from '@kubevirt-utils/constants/tabs-constants';
import {
  getInstanceTypeNameFromAnnotation,
  isInstanceTypeVM,
} from '@kubevirt-utils/resources/instancetype/helper';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getAffinity,
  getCPU,
  getCPUSockets,
  getDevices,
  getEvictionStrategy,
  getGPUDevices,
  getHostDevices,
  getInterfaces,
  getMemory,
  getNodeSelector,
  getStatusConditions,
  getTolerations,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { getNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { getInterfacesAndNetworks } from '@kubevirt-utils/resources/vm/utils/network/utils';
import { isWindows } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getEvictionStrategy as getVMIEvictionStrategy } from '@kubevirt-utils/resources/vmi';
import { getVMIBootDisk } from '@kubevirt-utils/resources/vmi/utils/discs';
import {
  getVMIBootLoader,
  getVMIDevices,
  getVMIDisks,
  getVMIInterfaces,
  getVMINetworks,
  getVMIVolumes,
} from '@kubevirt-utils/resources/vmi/utils/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  isInterfaceEphemeral,
  isPendingNICAdd,
  isPendingNICRemoval,
} from '@virtualmachines/details/tabs/configuration/network/utils/utils';

import {
  getBootDisk,
  getBootloader,
  getDisks,
  getNetworks,
  isHeadlessMode,
} from '../../../resources/vm/utils/selectors';

import { PendingChange } from './types';

export const checkInstanceTypeChanged = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  return vm.spec?.instancetype?.name !== getInstanceTypeNameFromAnnotation(vmi);
};

export const checkCPUMemoryChanged = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmMemory = getMemory(vm);
  const vmCPUSockets = getCPUSockets(vm);

  const vmiMemory = getMemory(vmi) || '';
  const vmiCPUSockets = getCPUSockets(vmi);

  return vmMemory !== vmiMemory || vmCPUSockets !== vmiCPUSockets;
};

export const checkBootOrderChanged = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi) || isEmpty(getDisks(vm))) {
    return false;
  }

  const vmBootDisk = getBootDisk(vm);
  const vmiBootDisk = getVMIBootDisk(vmi);

  return vmBootDisk?.name !== vmiBootDisk?.name;
};

export const checkBootModeChanged = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmiBootloader = getVMIBootLoader(vmi);
  const vmBootloader = getBootloader(vm);
  const usesDefaultBootloader = vmBootloader === undefined;
  return !usesDefaultBootloader && !isEqualObject(vmiBootloader, vmBootloader);
};

export const getChangedEnvDisks = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): string[] => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return [];
  }
  // to get env disks, we want to filter the volumes with configMap/ prop set
  const vmVolumes = getVolumes(vm)?.filter(
    (vol) => vol?.configMap || vol?.secret || vol?.serviceAccount,
  );
  const vmiVolumes = vmi?.spec?.volumes?.filter(
    (vol) => vol?.configMap || vol?.secret || vol?.serviceAccount,
  );

  const vmEnvDisksNames = vmVolumes?.map((vol) => vol?.name);
  const vmiEnvDisksNames = vmiVolumes?.map((vol) => vol?.name);
  // to get the changed disks, we want to intersect between the two name arrays
  // and get the disks that are NOT in the intersection
  const unchangedEnvDisks = vmEnvDisksNames?.filter((vmDiskName) =>
    vmiEnvDisksNames?.some((vmiDiskName) => vmDiskName === vmiDiskName),
  );
  const changedEnvDisks = [
    ...(vmEnvDisksNames?.filter((disk) => !unchangedEnvDisks?.includes(disk)) || []),
    ...(vmiEnvDisksNames?.filter((disk) => !unchangedEnvDisks?.includes(disk)) || []),
  ];

  return changedEnvDisks;
};

export const getChangedCDROMs = (vm: V1VirtualMachine, vmi: V1VirtualMachineInstance): string[] => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return [];
  }

  const vmDisks = getDisks(vm) || [];
  const vmiDisks = getVMIDisks(vmi) || [];
  const vmiDiskNames = vmiDisks?.map((disk) => disk.name);
  const vmChangedCDROMs = vmDisks.filter((disk) => disk.cdrom && !vmiDiskNames.includes(disk.name));

  return vmChangedCDROMs.map((disk) => `${disk.name}`);
};

export const getDefaultInterfaceModel = (vmi: V1VirtualMachineInstance): string => {
  return isWindows(vmi) ? interfaceModelType.E1000E : interfaceModelType.VIRTIO;
};

export const getInterfaceByName = (
  name: string,
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
) =>
  getInterfaces(vm)?.find((iface) => iface?.name === name) ||
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
            (state.runtime.iface?.model ?? getDefaultInterfaceModel(vmi))),
    )
    .map((state) => state.runtime?.network?.name);

  return Array.from(new Set([...pending, ...updated]));
};

export const getChangedNADsInterfaces = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): string[] => {
  const vmiNetworks = getVMINetworks(vmi);

  return (getNetworks(vm) || []).reduce((acc, network) => {
    const vmiNetworkName = vmiNetworks?.find((vmiNetwork) => vmiNetwork?.name === network?.name)
      ?.multus?.networkName;

    if (vmiNetworkName !== network?.multus?.networkName) {
      acc.push(network?.name);
    }
    return acc;
  }, []);
};

export const getChangedGPUDevices = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): string[] => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return [];
  }
  const vmGPUDevices = getGPUDevices(vm);
  const vmiGPUDevices = vmi?.spec?.domain?.devices?.gpus;
  const vmGPUDevicesNames = vmGPUDevices?.map((gpu) => gpu?.name);
  const vmiGPUDevicesNames = vmiGPUDevices?.map((gpu) => gpu?.name);
  const unchangedGPUDevices = vmGPUDevicesNames?.filter((vmGPUDeviceName) =>
    vmiGPUDevicesNames?.some((vmiGPUDeviceName) => vmGPUDeviceName === vmiGPUDeviceName),
  );
  const changedGPUDevices = [
    ...(vmGPUDevicesNames?.filter((gpu) => !unchangedGPUDevices?.includes(gpu)) || []),
    ...(vmiGPUDevicesNames?.filter((gpu) => !unchangedGPUDevices?.includes(gpu)) || []),
  ];
  return changedGPUDevices;
};

export const getChangedHostDevices = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): string[] => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return [];
  }
  const vmHostDevices = getHostDevices(vm);
  const vmiHostDevices = vmi?.spec?.domain?.devices?.hostDevices;
  const vmHostDevicesNames = vmHostDevices?.map((hostDevice) => hostDevice?.name);
  const vmiHostDevicesNames = vmiHostDevices?.map((hostDevice) => hostDevice?.name);
  const unchangedHostDevices = vmHostDevicesNames?.filter((vmHostDeviceName) =>
    vmiHostDevicesNames?.some((vmiHostDeviceName) => vmHostDeviceName === vmiHostDeviceName),
  );
  const changedHostDevices = [
    ...(vmHostDevicesNames?.filter((hostDevice) => !unchangedHostDevices?.includes(hostDevice)) ||
      []),
    ...(vmiHostDevicesNames?.filter((hostDevice) => !unchangedHostDevices?.includes(hostDevice)) ||
      []),
  ];
  return changedHostDevices;
};

export const getChangedVolumesHotplug = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): V1Volume[] => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return [];
  }

  const differentVolumes: V1Volume[] = differenceWith(getVMIVolumes(vmi), getVolumes(vm), isEqual);

  if (!isEmpty(differentVolumes)) {
    const result = differentVolumes.filter((volume: V1Volume) => {
      const hasHotpluggableFlag =
        volume?.dataVolume?.hotpluggable || volume?.persistentVolumeClaim?.hotpluggable;

      if (volume?.dataVolume || volume?.persistentVolumeClaim) {
        return false;
      }

      return !!hasHotpluggableFlag;
    });
    return result;
  }
};

export const getChangedDedicatedResources = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  currentSelection: boolean,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi) || isInstanceTypeVM(vm)) {
    return false;
  }
  const vmDedicatedResources = getCPU(vm)?.dedicatedCpuPlacement || false;
  const vmiDedicatedResources = getCPU(vmi)?.dedicatedCpuPlacement || false;

  return (
    vmDedicatedResources !== vmiDedicatedResources || currentSelection !== vmiDedicatedResources
  );
};

export const getChangedEvictionStrategy = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  clusterEvictionStrategy: string,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmEvictionStrategy = getEvictionStrategy(vm);
  const vmiEvictionStrategy = getVMIEvictionStrategy(vmi);

  if (!vmEvictionStrategy) return clusterEvictionStrategy !== vmiEvictionStrategy;

  return vmEvictionStrategy !== vmiEvictionStrategy;
};

export const getChangedStartStrategy = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmStartStrategy = !!vm?.spec?.template?.spec?.startStrategy;
  const vmiStartStrategy = !!vmi?.spec?.startStrategy;
  return vmStartStrategy !== vmiStartStrategy;
};
export const getChangedHostname = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmHostname = vm?.spec?.template?.spec?.hostname;
  const vmiHostname = vmi?.spec?.hostname;
  return vmHostname !== vmiHostname;
};

export const getChangedNodeSelector = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmNodeSelector = getNodeSelector(vm) || {};
  const vmiNodeSelector = vmi?.spec?.nodeSelector || {};

  return !isEqualObject(vmNodeSelector, vmiNodeSelector);
};

export const getChangedTolerations = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmTolerations = getTolerations(vm) || [];
  const vmiTolerations = vmi?.spec?.tolerations || [];

  return !isEqualObject(vmTolerations, vmiTolerations);
};

export const getChangedAffinity = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmAffinity = getAffinity(vm) || {};
  const vmiAffinity = vmi?.spec?.affinity || {};

  return !isEqualObject(vmAffinity, vmiAffinity);
};

export const getChangedCloudInit = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmCloudInit = getCloudInitData(getCloudInitVolume(vm)) || {};
  const vmiCloudInit =
    getCloudInitData(
      vmi?.spec?.volumes?.find((vol) => !!vol.cloudInitConfigDrive || !!vol.cloudInitNoCloud),
    ) || {};

  return (
    !isEqualObject(
      convertYAMLUserDataObject(vmCloudInit?.userData),
      convertYAMLUserDataObject(vmiCloudInit?.userData),
    ) ||
    !isEqualObject(
      convertYAMLToNetworkDataObject(vmCloudInit?.networkData),
      convertYAMLToNetworkDataObject(vmiCloudInit?.networkData),
    )
  );
};

export const getChangedAuthorizedSSHKey = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmAccessCredentials = vm?.spec?.template?.spec?.accessCredentials?.[0] || {};
  const vmiAccessCredentials = vmi?.spec?.accessCredentials?.[0] || {};

  return !isEqualObject(vmAccessCredentials, vmiAccessCredentials);
};

export const getChangedGuestSystemAccessLog = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmLogSerialConsole = (getDevices(vm) as V1Devices & { logSerialConsole: boolean })
    ?.logSerialConsole;
  const vmiLogSerialConsole = (getVMIDevices(vmi) as V1Devices & { logSerialConsole: boolean })
    ?.logSerialConsole;

  return vmLogSerialConsole !== vmiLogSerialConsole;
};

export const getChangedHeadlessMode = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }

  return isHeadlessMode(vm) !== isHeadlessMode(vmi);
};

export const getTabURL = (vm: V1VirtualMachine, tab: VirtualMachineDetailsTab) => {
  const tabPath = VirtualMachineConfigurationTabInner.has(tab)
    ? `${VirtualMachineDetailsTab.Configurations}/${tab}`
    : tab;
  return `/k8s/ns/${getNamespace(vm)}/${VirtualMachineModelRef}/${getName(vm)}/${tabPath}`;
};

export const getPendingChangesByTab = (
  pendingChanges: PendingChange[],
  tab: VirtualMachineDetailsTab,
): PendingChange[] => {
  return pendingChanges?.filter((change) => change?.tab === tab && change?.hasPendingChange) || [];
};

export const restartRequired = (vm: V1VirtualMachine): boolean =>
  getStatusConditions(vm).some(
    (condition) => condition?.type === RESTART_REQUIRED && condition?.status === 'True',
  );
