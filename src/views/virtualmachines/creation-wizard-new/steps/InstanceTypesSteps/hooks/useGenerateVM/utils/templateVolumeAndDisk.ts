import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { CLOUDINITDISK, ROOTDISK } from '@kubevirt-utils/constants/constants';

export const getDomainDisks = (isIso: boolean, vmName: string) => {
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

const getRootDiskVolumeName = (isIso: boolean, vmName: string) => {
  if (isIso) return `${vmName}-cdrom-iso`;

  return ROOTDISK;
};

const getISOVolumes = (isIso: boolean, vmName: string) => {
  if (!isIso) return [];

  return [
    {
      dataVolume: { name: `${vmName}-volume-blank` },
      name: ROOTDISK,
    },
  ];
};

export const getTemplateVolumes = (
  volumeName: string,
  isIso: boolean,
  vmName: string,
  isWindowsVM: boolean,
  populatedCloudInitYAML: string,
) => {
  return [
    {
      dataVolume: { name: volumeName },
      name: getRootDiskVolumeName(isIso, vmName),
    },
    ...(!isWindowsVM
      ? [
          {
            cloudInitNoCloud: {
              userData: populatedCloudInitYAML,
            },
            name: CLOUDINITDISK,
          },
        ]
      : []),
    ...getISOVolumes(isIso, vmName),
  ];
};
