import { getLabel, getName } from '../shared';

import { ISO_FILE_EXTENSION, KUBEVIRT_ISO_LABEL } from './constants';
import { type BootableVolume } from './types';

export const isBootableVolumeISO = (bootableVolume: BootableVolume): boolean =>
  getLabel(bootableVolume, KUBEVIRT_ISO_LABEL) === 'true';

export const isIsoFileName = (name?: null | string): boolean =>
  Boolean(name?.toLowerCase().endsWith(ISO_FILE_EXTENSION));

export const isIsoUrl = (url?: null | string): boolean =>
  isIsoFileName(url?.split('?')[0]?.split('/').pop());

export const detectBootableVolumeIsIso = (bootableVolume: BootableVolume): boolean =>
  isBootableVolumeISO(bootableVolume) || isIsoFileName(getName(bootableVolume));
