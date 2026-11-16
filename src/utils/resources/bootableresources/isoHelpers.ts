import { getLabel, getName } from '../shared';

import { ISO_FILE_EXTENSION, KUBEVIRT_ISO_LABEL } from './constants';
import { type BootableVolume } from './types';

export const isBootableVolumeISO = (bootableVolume: BootableVolume): boolean =>
  getLabel(bootableVolume, KUBEVIRT_ISO_LABEL) === 'true';

export const isIsoFile = (pathOrUrl?: null | string): boolean => {
  const fileName = pathOrUrl?.split(/[?#]/)[0]?.split('/').pop();
  return Boolean(fileName?.toLowerCase().endsWith(ISO_FILE_EXTENSION));
};

export const detectBootableVolumeIsIso = (bootableVolume: BootableVolume): boolean =>
  isBootableVolumeISO(bootableVolume) || isIsoFile(getName(bootableVolume));
