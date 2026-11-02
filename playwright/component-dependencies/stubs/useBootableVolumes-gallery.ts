/**
 * Gallery alias for `@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes`.
 * Serves bootable volumes from the gallery watch registry (`virt-page-fixtures`).
 */
import { getGalleryBootableVolumes } from '../stories/gallery-watch-registry';
import type { UseBootableVolumesValues } from '@virtualmachines/wizard/utils/types';

/** Returns scene boot volumes; ignores namespace/cluster overrides. */
const useBootableVolumes = (
  _namespace?: string,
  _clusterOverride?: string,
): UseBootableVolumesValues => ({
  bootableVolumes: getGalleryBootableVolumes() ?? [],
  dataImportCrons: [],
  dvSources: {},
  error: undefined,
  loaded: true,
  pvcSources: {},
  volumeSnapshotSources: {},
});

export default useBootableVolumes;
