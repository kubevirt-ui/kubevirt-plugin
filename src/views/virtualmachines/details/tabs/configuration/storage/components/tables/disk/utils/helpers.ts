import { type TFunction } from 'i18next';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  CONTAINER_EPHERMAL,
  OTHER,
} from '@kubevirt-utils/components/DiskModal/components/utils/constants';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { type DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';

export const isHotplugVolume = (
  vm: V1VirtualMachine,
  diskName: string,
  vmi?: V1VirtualMachineInstance,
): boolean => {
  const volumeStatus = vmi?.status?.volumeStatus?.find((volStatus) => volStatus.name === diskName);
  const vmVolume = getVolumes(vm)?.find((vol) => vol?.name === diskName);
  const hotplugStatus =
    volumeStatus?.hotplugVolume != null ||
    vmVolume?.dataVolume?.hotpluggable === true ||
    vmVolume?.persistentVolumeClaim?.hotpluggable === true;
  return !!hotplugStatus;
};

export const getTranslatedSource = (source: string, t: TFunction): string => {
  if (source === OTHER) return t(OTHER);
  if (source === CONTAINER_EPHERMAL) return t(CONTAINER_EPHERMAL);
  return source;
};

export const isPVCSource = (obj: DiskRowDataLayout): boolean =>
  ![CONTAINER_EPHERMAL, OTHER].includes(obj?.source);

export const isPVCStatusBound = (obj: DiskRowDataLayout): boolean => obj?.sourceStatus === 'Bound';
