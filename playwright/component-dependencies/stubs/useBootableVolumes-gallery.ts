import type { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';

import { getGalleryBootableVolumes } from '../stories/gallery-watch-registry';

const useBootableVolumes = (
  _namespace?: string,
  _clusterOverride?: string,
): {
  bootableVolumes: BootableVolume[];
  dataImportCrons: [];
  dvSources: Record<string, unknown>;
  error: undefined;
  loaded: boolean;
} => ({
  bootableVolumes: getGalleryBootableVolumes() ?? [],
  dataImportCrons: [],
  dvSources: {},
  error: undefined,
  loaded: true,
  pvcSources: {},
  volumeSnapshotSources: {},
});

export default useBootableVolumes;
