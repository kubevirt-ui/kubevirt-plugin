import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1Devices,
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { V1Disk } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  convertYAMLToNetworkDataObject,
  convertYAMLUserDataObject,
  getCloudInitData,
  getCloudInitVolume,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { RESTART_REQUIRED } from '@kubevirt-utils/components/PendingChanges/utils/constants';
import {
  VirtualMachineConfigurationTabInner,
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';
import { getInstanceTypeNameFromAnnotation } from '@kubevirt-utils/resources/instancetype/helper';
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
import { DEFAULT_NETWORK_INTERFACE } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  DESCHEDULER_EVICT_LABEL,
  getEvictionStrategy as getVMIEvictionStrategy,
} from '@kubevirt-utils/resources/vmi';
import {
  getVMIBootLoader,
  getVMIDevices,
  getVMIInterfaces,
  getVMINetworks,
  getVMIVolumes,
} from '@kubevirt-utils/resources/vmi/utils/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { isPendingHotPlugNIC } from '@virtualmachines/details/tabs/configuration/network/utils/utils';

import {
  getAutoAttachPodInterface,
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

  const getCleanDisk = (disk: V1Disk) => ({ bootOrder: disk?.bootOrder, name: disk?.name });
  const sortDisks = (a: V1Disk, b: V1Disk) => (a?.name > b?.name ? 1 : -1);
  const vmDisks = (vm?.spec?.template?.spec?.domain?.devices?.disks || [])
    .map(getCleanDisk)
    .sort(sortDisks);
  const vmiDisks = (vmi?.spec?.domain?.devices?.disks || []).map(getCleanDisk).sort(sortDisks);
  if (vmDisks?.length !== vmiDisks?.length) return true;

  const hasChanges = vmDisks?.some((val, idx) => !isEqualObject(val, vmiDisks[idx]));

  return hasChanges;
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

export const getInterfaceByName = (
  name: string,
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
) =>
  getInterfaces(vm)?.find((iface) => iface?.name === name) ||
  getVMIInterfaces(vmi)?.find((iface) => iface?.name === name);

export const getChangedNICs = (vm: V1VirtualMachine, vmi: V1VirtualMachineInstance): string[] => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return [];
  }
  const vmInterfaces = getInterfaces(vm);
  const vmiInterfaces = getVMIInterfaces(vmi);
  const vmNICsNames = vmInterfaces?.map((nic) => nic?.name) || [];
  const vmiNICsNames = vmiInterfaces?.map((nic) => nic?.name) || [];

  const autoAttachPodInterface = getAutoAttachPodInterface(vm) !== false;
  if (
    autoAttachPodInterface &&
    vmiInterfaces?.find((nic) => nic.name === DEFAULT_NETWORK_INTERFACE.name) &&
    !vmNICsNames.includes(DEFAULT_NETWORK_INTERFACE.name)
  ) {
    vmNICsNames.push(DEFAULT_NETWORK_INTERFACE.name);
  }

  const unchangedNICs = vmNICsNames?.filter((vmNicName) =>
    vmiNICsNames?.some((vmiNicName) => vmNicName === vmiNicName),
  );
  const changedNICs = [
    ...(vmNICsNames?.filter((nic) => !unchangedNICs?.includes(nic)) || []),
    ...(vmiNICsNames?.filter((nic) => !unchangedNICs?.includes(nic)) || []),
    ...(unchangedNICs?.filter((nic) => isPendingHotPlugNIC(vm, vmi, nic)) || []),

    ...(getChangedNADsInterfaces(vm, vmi) || []),
  ];

  return Array.from(new Set(changedNICs));
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

export const hasPendingChange = (pendingChange: PendingChange[]) =>
  pendingChange?.some((p) => p.hasPendingChange);

// Checks for other types of changes and non-hot-plug NIC changes
export const nonHotPlugNICChangesExist = (
  pendingChanges: PendingChange[],
  nonHotPlugNICsExist: boolean,
) => {
  const moreChangeTypesExist = pendingChanges
    ?.filter((change) => change?.hasPendingChange)
    ?.some((change) => change?.tabLabel !== VirtualMachineDetailsTabLabel.Network);
  return moreChangeTypesExist || nonHotPlugNICsExist;
};

const isHotPlugNIC = (
  nicName: string,
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  const iface = getInterfaceByName(nicName, vm, vmi);
  return Boolean(iface?.bridge || iface?.sriov);
};

export const getSortedNICs = (
  changedNICs: string[],
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): { hotPlugNICs: string[]; nonHotPlugNICs: string[] } =>
  changedNICs?.reduce(
    (acc, nicName) => {
      const isHotPlug = isHotPlugNIC(nicName, vm, vmi);
      isHotPlug ? acc.hotPlugNICs.push(nicName) : acc.nonHotPlugNICs.push(nicName);
      return acc;
    },
    { hotPlugNICs: [], nonHotPlugNICs: [] },
  );

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
    return differentVolumes.filter(
      (volume: V1Volume) =>
        volume?.dataVolume?.hotpluggable || volume?.persistentVolumeClaim?.hotpluggable,
    );
  }
};

export const getChangedDedicatedResources = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  currentSelection: boolean,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
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

export const getChangedDescheduler = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  currentSelection: boolean,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }

  const vmDescheduler = !!vm?.spec?.template?.metadata?.annotations?.[DESCHEDULER_EVICT_LABEL];
  const vmiDescheduler = !!vmi?.metadata?.annotations?.[DESCHEDULER_EVICT_LABEL];

  return vmDescheduler !== vmiDescheduler || currentSelection !== vmiDescheduler;
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

export const getTabURL = (vm: V1VirtualMachine, tab: string) => {
  const tabPath = VirtualMachineConfigurationTabInner[tab]
    ? `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineConfigurationTabInner[tab]}`
    : tab;
  return `/k8s/ns/${vm?.metadata?.namespace}/${VirtualMachineModelRef}/${vm?.metadata?.name}/${tabPath}`;
};

export const getPendingChangesByTab = (pendingChanges: PendingChange[]) => {
  const pendingChangesDetailsTab = pendingChanges?.filter(
    (change) =>
      change?.tabLabel === VirtualMachineDetailsTabLabel.Details && change?.hasPendingChange,
  );
  const pendingChangesSchedulingTab = pendingChanges?.filter(
    (change) =>
      change?.tabLabel === VirtualMachineDetailsTabLabel.Scheduling && change?.hasPendingChange,
  );
  const pendingChangesEnvTab = pendingChanges?.filter(
    (change) =>
      change?.tabLabel === VirtualMachineDetailsTabLabel.Environment && change?.hasPendingChange,
  );
  const pendingChangesNICsTab = pendingChanges?.filter(
    (change) =>
      change?.tabLabel === VirtualMachineDetailsTabLabel.Network && change?.hasPendingChange,
  );
  const pendingChangesScriptsTab = pendingChanges?.filter(
    (change) =>
      change?.tabLabel === VirtualMachineDetailsTabLabel.Scripts && change?.hasPendingChange,
  );
  const pendingChangesDisksTab = pendingChanges?.filter(
    (change) =>
      change?.tabLabel === VirtualMachineDetailsTabLabel.Disks && change?.hasPendingChange,
  );

  return {
    pendingChangesDetailsTab,
    pendingChangesDisksTab,
    pendingChangesEnvTab,
    pendingChangesNICsTab,
    pendingChangesSchedulingTab,
    pendingChangesScriptsTab,
  };
};

export const restartRequired = (vm: V1VirtualMachine): boolean =>
  getStatusConditions(vm)?.some(
    (condition) => condition?.type === RESTART_REQUIRED && condition?.status === 'True',
  );
