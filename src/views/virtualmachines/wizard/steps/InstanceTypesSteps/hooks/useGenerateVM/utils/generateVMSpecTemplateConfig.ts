import { type V1DataVolumeTemplateSpec } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { DEFAULT_DISK_SIZE } from '@kubevirt-utils/components/DiskModal/utils/constants';
import { DataSourceModel } from '@kubevirt-utils/models';
import { isBootableVolumePVCKind } from '@kubevirt-utils/resources/bootableresources/helpers';
import {
  getDataVolumeSize,
  getPVCSize,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

import { type GenerateVMSpecDataVolumeTemplates } from '../types';

type DataVolumeStorageResources = NonNullable<
  NonNullable<NonNullable<V1DataVolumeTemplateSpec['spec']>['storage']>['resources']
>;

type BootVolumeDataVolumeSource = Pick<
  NonNullable<V1DataVolumeTemplateSpec['spec']>,
  'source' | 'sourceRef'
>;

const getMainDataVolumeStorage = (
  dvSource: GenerateVMSpecDataVolumeTemplates['dvSource'],
  pvcSource: GenerateVMSpecDataVolumeTemplates['pvcSource'],
  customDiskSize?: string,
  isIso?: boolean,
): DataVolumeStorageResources => {
  if (customDiskSize && !isIso) {
    return { requests: { storage: customDiskSize } };
  }

  if (dvSource || pvcSource) {
    return {
      requests: {
        storage: getDataVolumeSize(dvSource) ?? getPVCSize(pvcSource),
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
): V1DataVolumeTemplateSpec[] => {
  if (!isIso) return [];

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- empty string must fall back
  const storage = customDiskSize || DEFAULT_DISK_SIZE;

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

const getBootVolumeDataVolumeSource = (
  selectedBootableVolume: BootableVolume,
): BootVolumeDataVolumeSource => {
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
  isIso,
  pvcSource,
  selectedBootableVolume,
  storageClassName,
  vmName,
  volumeName,
}: GenerateVMSpecDataVolumeTemplates): V1DataVolumeTemplateSpec[] => {
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
