/**
 * Gallery alias for `@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource`.
 * Resolves list/single resources from `gallery-watch-registry` by GVK + namespace.
 */
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import type { WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

import { getGalleryWatchList } from '../stories/gallery-watch-registry';

type Result<T> = [T, boolean, Error | null];

/** In-memory watch backed by scene presets (`GalleryDataInitializer`). */
const useKubevirtWatchResource = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource & { cluster?: string },
): Result<T> => {
  const list = getGalleryWatchList(watchOptions);
  if (watchOptions?.isList) {
    return [(list ?? []) as T, true, null];
  }
  const single = list?.[0];
  return [(single ?? undefined) as T, true, null];
};

export default useKubevirtWatchResource;
