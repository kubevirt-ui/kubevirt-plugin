import { useMemo } from 'react';

import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { getName } from '@kubevirt-utils/resources/shared';
import useKubevirtWatchResources from '@multicluster/hooks/useKubevirtWatchResources';
import { type PackageManifestKind } from '@overview/utils/types';

import { PACKAGE_MANIFESTS_WATCH_KEY } from './utils/constants';
import { type UsePackageManifestsParams, type UsePackageManifestsReturn } from './utils/types';
import { getPackageManifestWatchResources } from './utils/utils';

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
  const allManifests = (packageManifestWatch?.data ?? []) as PackageManifestKind[];
  const loaded = packageManifestWatch?.loaded ?? false;
  const loadError = packageManifestWatch?.loadError;

  const packageManifests = useMemo(() => {
    if (!loaded) return [];

    const nameSet = new Set(memoizedPackageNames);
    return allManifests.filter((pkg) => nameSet.has(getName(pkg)));
  }, [allManifests, loaded, memoizedPackageNames]);

  const loadErrors = useMemo(() => (loadError ? [loadError] : []), [loadError]);

  return useMemo(
    () => ({ loaded, loadErrors, packageManifests }),
    [loaded, loadErrors, packageManifests],
  );
};

export default usePackageManifests;
