import { useMemo } from 'react';

import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { getName } from '@kubevirt-utils/resources/shared';
import { type PackageManifestKind } from '@kubevirt-utils/types/olm';
import useKubevirtWatchResources from '@multicluster/hooks/useKubevirtWatchResources';

import { PACKAGE_MANIFESTS_WATCH_KEY } from './utils/constants';
import { type UsePackageManifestsParams, type UsePackageManifestsReturn } from './utils/types';
import {
  getPackageManifestWatchResources,
  mapWatchResourceErrors,
  selectPreferredPackageManifests,
} from './utils/utils';

const usePackageManifests = ({
  cluster,
  packageNames,
}: UsePackageManifestsParams): UsePackageManifestsReturn => {
  const memoizedPackageNames = useDeepCompareMemoize(packageNames);

  const packageManifestResources = useMemo(
    () => getPackageManifestWatchResources(cluster),
    [cluster],
  );

  const packageManifestData =
    useKubevirtWatchResources<Record<string, PackageManifestKind[]>>(packageManifestResources);

  const packageManifestWatch = packageManifestData?.[PACKAGE_MANIFESTS_WATCH_KEY];
  const loaded = packageManifestWatch?.loaded ?? false;

  const packageManifests = useMemo(() => {
    if (!loaded) return [];

    const allManifests = packageManifestWatch?.data ?? [];
    const nameSet = new Set(memoizedPackageNames);
    return selectPreferredPackageManifests(allManifests.filter((pkg) => nameSet.has(getName(pkg))));
  }, [loaded, memoizedPackageNames, packageManifestWatch?.data]);

  const loadErrors = useMemo(
    () => mapWatchResourceErrors([PACKAGE_MANIFESTS_WATCH_KEY], packageManifestData),
    [packageManifestData],
  );

  return useMemo(
    () => ({ loaded, loadErrors, packageManifests }),
    [loaded, loadErrors, packageManifests],
  );
};

export default usePackageManifests;
