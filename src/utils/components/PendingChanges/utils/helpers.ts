import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1Interface,
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
import {
  VirtualMachineConfigurationTabInner,
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';
import {
  getAffinity,
  getGPUDevices,
  getHostDevices,
  getInterfaces,
  getNodeSelector,
  getTolerations,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { DESCHEDULER_EVICT_LABEL } from '@kubevirt-utils/resources/vmi';
import { getVMIInterfaces, getVMIVolumes } from '@kubevirt-utils/resources/vmi/utils/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { PendingChange } from './types';

export const checkCPUMemoryChanged = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmRequests = vm?.spec?.template?.spec?.domain?.resources?.requests;
  const vmCPU = vm?.spec?.template?.spec?.domain?.cpu?.cores || 0;

  const vmiRequests: { [key in string]?: string } = vmi?.spec?.domain?.resources?.requests || {};

  const vmiCPU = vmi?.spec?.domain?.cpu?.cores || 0;

  const memoryChanged = vmRequests
    ? !isEqualObject(vmRequests, vmiRequests)
    : vmiRequests?.memory !== vm?.spec?.template?.spec?.domain?.memory?.guest;

  return memoryChanged || vmCPU !== vmiCPU;
};

export const checkBootOrderChanged = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
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
  const vmiBootloader = vmi?.spec?.domain?.firmware?.bootloader;
  const vmBootloader = vm?.spec?.template?.spec?.domain?.firmware?.bootloader;
  return !isEqualObject(vmiBootloader, vmBootloader);
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

export const isBridge = (iface: V1Interface) => Boolean(iface?.bridge);

export const getChangedNICs = (vm: V1VirtualMachine, vmi: V1VirtualMachineInstance): string[] => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return [];
  }
  const vmInterfaces = getInterfaces(vm);
  const vmiInterfaces = getVMIInterfaces(vmi);
  const vmNICsNames = vmInterfaces?.map((nic) => nic?.name);
  const vmiNICsNames = vmiInterfaces?.map((nic) => nic?.name);
  const unchangedNICs = vmNICsNames?.filter((vmNicName) =>
    vmiNICsNames?.some((vmiNicName) => vmNicName === vmiNicName),
  );
  const changedNICs = [
    ...(vmNICsNames?.filter((nic) => !unchangedNICs?.includes(nic)) || []),
    ...(vmiNICsNames?.filter((nic) => !unchangedNICs?.includes(nic)) || []),
  ];

  if (
    (!vmInterfaces || vmInterfaces?.length === 0) &&
    vmiInterfaces?.length === 1 &&
    vmiInterfaces?.[0].name === 'default' &&
    vmiInterfaces?.[0]?.masquerade
  )
    return [];

  return changedNICs;
};

export const hasPendingChange = (pendingChange: PendingChange[]) =>
  pendingChange?.[0]?.hasPendingChange;

// Checks for other types of changes and non-hot-plug NIC changes
export const nonHotPlugNICChangesExist = (
  pendingChanges: PendingChange[],
  nonHotPlugNICsExist: boolean,
) => {
  const moreChangeTypesExist = pendingChanges?.every(
    (change) => change?.tabLabel === VirtualMachineDetailsTabLabel.NetworkInterfaces,
  );
  return moreChangeTypesExist || nonHotPlugNICsExist;
};

const getSortedNICs = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): { hotPlugNICs: string[]; nonHotPlugNICs: string[] } => {
  const changedNICs = getChangedNICs(vm, vmi);
  return changedNICs?.reduce(
    (acc, nicName) => {
      const isHotPlug = Boolean(getInterfaceByName(nicName, vm, vmi)?.bridge);
      isHotPlug ? acc.hotPlugNICs.push(nicName) : acc.nonHotPlugNICs.push(nicName);
      return acc;
    },
    { hotPlugNICs: [], nonHotPlugNICs: [] },
  );
};

export const getSortedNICPendingChanges = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  history,
) => {
  const sortedNICs = getSortedNICs(vm, vmi);
  const { hotPlugNICs, nonHotPlugNICs } = sortedNICs;

  return {
    hotPlugPendingChanges: [
      {
        handleAction: () => {
          history.push(getTabURL(vm, VirtualMachineDetailsTab.NetworkInterfaces));
        },
        hasPendingChange: !isEmpty(hotPlugNICs),
        label: hotPlugNICs?.length > 1 ? hotPlugNICs.join(', ') : hotPlugNICs[0],
        tabLabel: VirtualMachineDetailsTabLabel.NetworkInterfaces,
      },
    ],
    nonHotPlugPendingChanges: [
      {
        handleAction: () => {
          history.push(getTabURL(vm, VirtualMachineDetailsTab.NetworkInterfaces));
        },
        hasPendingChange: !isEmpty(nonHotPlugNICs),
        label: nonHotPlugNICs?.length > 1 ? nonHotPlugNICs.join(', ') : nonHotPlugNICs[0],
        tabLabel: VirtualMachineDetailsTabLabel.NetworkInterfaces,
      },
    ],
  };
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
  const vmDedicatedResources =
    vm?.spec?.template?.spec?.domain?.cpu?.dedicatedCpuPlacement || false;
  const vmiDedicatedResources = vmi?.spec?.domain?.cpu?.dedicatedCpuPlacement || false;

  return (
    vmDedicatedResources !== vmiDedicatedResources || currentSelection !== vmiDedicatedResources
  );
};

export const getChangedEvictionStrategy = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  currentSelection: boolean,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmEvictionStrategy = !!vm?.spec?.template?.spec?.evictionStrategy;
  const vmiEvictionStrategy = !!vmi?.spec?.evictionStrategy;
  return vmEvictionStrategy !== vmiEvictionStrategy || currentSelection !== vmiEvictionStrategy;
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

export const getChangedHeadlessMode = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): boolean => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return false;
  }
  const vmDevices = vm?.spec?.template?.spec?.domain?.devices;
  const vmiDevices = vmi?.spec?.domain?.devices;

  const vmHeadless = !!vmDevices?.autoattachGraphicsDevice;
  const vmiHeadless = !!vmiDevices?.autoattachGraphicsDevice;

  return (
    vmHeadless !== vmiHeadless ||
    vmDevices?.hasOwnProperty('autoattachGraphicsDevice') !==
      vmiDevices?.hasOwnProperty('autoattachGraphicsDevice')
  );
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
      change?.tabLabel === VirtualMachineDetailsTabLabel.NetworkInterfaces &&
      change?.hasPendingChange,
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
