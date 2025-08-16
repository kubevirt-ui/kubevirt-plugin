import { V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { EMPTY_DISK_IMAGE_PATTERNS } from './constants';
import { getContainerDiskImage } from './selectors';

export const isEmptyContainerDiskImage = (volume: V1Volume): boolean => {
  const image = getContainerDiskImage(volume);
  if (isEmpty(image)) return true;

  return Object.values(EMPTY_DISK_IMAGE_PATTERNS).some((pattern) => image.includes(pattern));
};
