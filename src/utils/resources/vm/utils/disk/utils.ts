import { V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { EMPTY_DISK_IMAGE_PATTERNS } from './constants';
import { getContainerDiskImage } from './selectors';

export const isEmptyContainerDiskImage = (volume: V1Volume): boolean => {
  const image = getContainerDiskImage(volume);
  if (!image || image === '') return true;

  const { BLANK, EMPTY, SCRATCH } = EMPTY_DISK_IMAGE_PATTERNS;

  return image.includes(BLANK) || image.includes(EMPTY) || image.includes(SCRATCH);
};
