import { type V1Disk, type V1Volume } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { CLOUDINITDISK, ROOTDISK } from '@kubevirt-utils/constants/constants';

export const getDomainDisks = (isIso: boolean, vmName: string): V1Disk[] => {
  if (isIso) {
    return [
      {
        bootOrder: 2,
        cdrom: {
          bus: InterfaceTypes.SATA,
        },
        name: `${vmName}-cdrom-iso`,
      },
      {
        bootOrder: 1,
        name: ROOTDISK,
      },
    ];
  }

  return [
    {
      bootOrder: 1,
      name: ROOTDISK,
    },
  ];
};

const getRootDiskVolumeName = (isIso: boolean, vmName: string): string => {
  if (isIso) return `${vmName}-cdrom-iso`;

  return ROOTDISK;
};

const getISOVolumes = (isIso: boolean, vmName: string): V1Volume[] => {
  if (!isIso) return [];

  return [
    {
      dataVolume: { name: `${vmName}-volume-blank` },
      name: ROOTDISK,
    },
  ];
};

const getCloudInitVolume = (isWindowsVM: boolean, populatedCloudInitYAML: string): V1Volume[] => {
  if (isWindowsVM) return [];

  return [
    {
      cloudInitNoCloud: {
        userData: populatedCloudInitYAML,
      },
      name: CLOUDINITDISK,
    },
  ];
};

export const getTemplateVolumes = (
  volumeName: string,
  isIso: boolean,
  vmName: string,
  isWindowsVM: boolean,
  populatedCloudInitYAML: string,
): V1Volume[] => {
  return [
    {
      dataVolume: { name: volumeName },
      name: getRootDiskVolumeName(isIso, vmName),
    },
    ...getCloudInitVolume(isWindowsVM, populatedCloudInitYAML),
    ...getISOVolumes(isIso, vmName),
  ];
};

export const getNoBootSourceVolumes = (
  isWindowsVM: boolean,
  populatedCloudInitYAML: string,
): V1Volume[] => getCloudInitVolume(isWindowsVM, populatedCloudInitYAML);
