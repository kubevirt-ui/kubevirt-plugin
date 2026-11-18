import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { ROOTDISK } from '@kubevirt-utils/constants/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { getDataVolumeStorageClassName } from '@kubevirt-utils/resources/vm/utils/dataVolumeTemplate/selectors';
import { getDataVolumeName } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { DNS1123LabelMaxLength } from '@kubevirt-utils/utils/validation';
import { getIsoBlankDataVolumeName } from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils/bootVolumeNames';

export const allocateUnusedName = (preferredName: string, usedNames: Set<string>): string => {
  if (!usedNames.has(preferredName)) {
    return preferredName;
  }

  let index = 2;
  while (index < Number.MAX_SAFE_INTEGER) {
    const suffix = `-${index}`;
    const maxPrefixLength = DNS1123LabelMaxLength - suffix.length;
    const candidate = `${preferredName.slice(0, Math.max(1, maxPrefixLength))}${suffix}`;
    if (!usedNames.has(candidate)) {
      return candidate;
    }
    index += 1;
  }

  return preferredName;
};

export const getUsedDiskAndVolumeNames = (vm: V1VirtualMachine): Set<string> => {
  const usedNames = new Set<string>();
  for (const disk of getDisks(vm) ?? []) {
    if (disk.name) {
      usedNames.add(disk.name);
    }
  }
  for (const volume of getVolumes(vm) ?? []) {
    if (volume.name) {
      usedNames.add(volume.name);
    }
  }
  return usedNames;
};

export const getStorageClassNameForDisk = (
  vm: V1VirtualMachine,
  diskName: string,
): string | undefined => {
  const volume = getVolumes(vm)?.find((vol) => vol.name === diskName);
  const dataVolumeName = getDataVolumeName(volume);
  if (!dataVolumeName) {
    return undefined;
  }

  const template = getDataVolumeTemplates(vm)?.find(
    (dataVolumeTemplate) => getName(dataVolumeTemplate) === dataVolumeName,
  );
  return getDataVolumeStorageClassName(template);
};

/** Add a blank install disk (prefer `rootdisk` when free) and return its disk name. */
export const addBlankInstallDisk = (
  draftVM: V1VirtualMachine,
  vmName: string,
  systemDiskSize: string,
  storageClassName?: string,
): string => {
  const disks = getDisks(draftVM) ?? [];
  const volumes = getVolumes(draftVM) ?? [];
  const dataVolumeTemplates = draftVM.spec.dataVolumeTemplates ?? [];
  const usedNames = getUsedDiskAndVolumeNames(draftVM);
  const usedDataVolumeNames = new Set(
    [
      ...dataVolumeTemplates.map((template) => getName(template)),
      ...volumes.map((volume) => getDataVolumeName(volume)),
    ].filter((name): name is string => Boolean(name)),
  );

  // Disk names must be DNS-1123 labels (no dots); DataVolume names may keep dots.
  const blankDiskName = allocateUnusedName(
    usedNames.has(ROOTDISK) ? getIsoBlankDataVolumeName(vmName.replace(/\./g, '-')) : ROOTDISK,
    usedNames,
  );
  const blankDataVolumeName = allocateUnusedName(
    getIsoBlankDataVolumeName(vmName),
    usedDataVolumeNames,
  );

  dataVolumeTemplates.push({
    metadata: { name: blankDataVolumeName },
    spec: {
      source: { blank: {} },
      storage: {
        resources: { requests: { storage: systemDiskSize } },
        ...(storageClassName ? { storageClassName } : {}),
      },
    },
  });
  draftVM.spec.dataVolumeTemplates = dataVolumeTemplates;

  disks.push({
    disk: { bus: InterfaceTypes.VIRTIO },
    name: blankDiskName,
  });
  volumes.push({
    dataVolume: { name: blankDataVolumeName },
    name: blankDiskName,
  });

  draftVM.spec.template.spec.domain.devices.disks = disks;
  draftVM.spec.template.spec.volumes = volumes;

  return blankDiskName;
};
