import { DEFAULT_DISK_SIZE } from '@kubevirt-utils/components/DiskModal/utils/constants';
import { DataSourceModel } from '@kubevirt-utils/models';
import { isBootableVolumePVCKind } from '@kubevirt-utils/resources/bootableresources/helpers';
import {
  getDataVolumeSize,
  getPVCSize,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { GenerateVMCallback, GenerateVMSpecDataVolumeTemplates } from '../types';

const getMainDataVolumeStorage = (
  dvSource: Parameters<GenerateVMCallback>[0]['dvSource'],
  pvcSource: Parameters<GenerateVMCallback>[0]['pvcSource'],
  customDiskSize?: string,
  isIso?: boolean,
) => {
  if (customDiskSize && !isIso) {
    return { requests: { storage: customDiskSize } };
  }

  if (dvSource || pvcSource) {
    return {
      requests: {
        storage: getDataVolumeSize(dvSource) || getPVCSize(pvcSource),
      },
    };
  }

  return { requests: { storage: DEFAULT_DISK_SIZE } };
};

const getISODataVolumeTemplates = (
  isIso: boolean,
  vmName: string,
  storageClassName: string,
  customDiskSize?: string,
) => {
  if (!isIso) return [];

  const storage = customDiskSize || '30Gi';

  return [
    {
      metadata: {
        name: `${vmName}-volume-blank`,
      },
      spec: {
        source: {
          blank: {},
        },
        storage: {
          resources: { requests: { storage } },
          storageClassName,
        },
      },
    },
  ];
};

const getBootVolumeDataVolumeSource = (selectedBootableVolume: BootableVolume) => {
  const name = getName(selectedBootableVolume);
  const namespace = getNamespace(selectedBootableVolume);

  if (isBootableVolumePVCKind(selectedBootableVolume)) {
    return {
      source: {
        pvc: { name, namespace },
      },
    };
  }

  return {
    sourceRef: {
      kind: DataSourceModel.kind,
      name,
      namespace,
    },
  };
};

export const getDataVolumeTemplates = ({
  customDiskSize,
  dvSource,
  pvcSource,
  isIso,
  storageClassName,
  vmName,
  volumeName,
  selectedBootableVolume,
}: GenerateVMSpecDataVolumeTemplates) => {
  return [
    {
      metadata: {
        name: volumeName,
      },
      spec: {
        ...getBootVolumeDataVolumeSource(selectedBootableVolume),
        storage: {
          resources: getMainDataVolumeStorage(dvSource, pvcSource, customDiskSize, isIso),
          storageClassName,
        },
      },
    },
    ...getISODataVolumeTemplates(isIso, vmName, storageClassName, customDiskSize),
  ];
};
