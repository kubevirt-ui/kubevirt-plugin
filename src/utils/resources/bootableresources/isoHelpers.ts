import { getLabel, getName } from '../shared';

import { ISO_FILE_EXTENSION, KUBEVIRT_ISO_LABEL } from './constants';
import { type BootableVolume } from './types';

/** Splits a URL/path at the first query (`?`) or fragment (`#`) separator. */
const URL_QUERY_OR_FRAGMENT_SEPARATOR = /[?#]/;

export const getIsoDetectionPath = (pathOrUrl?: null | string): string =>
  pathOrUrl?.split(URL_QUERY_OR_FRAGMENT_SEPARATOR)?.[0] ?? '';

export const isBootableVolumeISO = (bootableVolume: BootableVolume): boolean =>
  getLabel(bootableVolume, KUBEVIRT_ISO_LABEL) === 'true';

/** Local upload filenames may contain `#`; do not strip URL fragment separators. */
export const isIsoFilename = (fileName?: null | string): boolean =>
  Boolean(fileName?.toLowerCase().endsWith(ISO_FILE_EXTENSION));

/** URL/path ISO check: strip query/fragment, then test the last path segment. */
export const isIsoFile = (pathOrUrl?: null | string): boolean =>
  isIsoFilename(getIsoDetectionPath(pathOrUrl).split('/').pop());

export const detectBootableVolumeIsIso = (bootableVolume: BootableVolume): boolean =>
  isBootableVolumeISO(bootableVolume) || isIsoFile(getName(bootableVolume));
