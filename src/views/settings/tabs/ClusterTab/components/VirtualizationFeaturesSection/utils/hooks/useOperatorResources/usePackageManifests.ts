import { useMemo } from 'react';

import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import useKubevirtWatchResources from '@multicluster/hooks/useKubevirtWatchResources';
import { type PackageManifestKind } from '@overview/utils/types';

import { type UsePackageManifestsParams, type UsePackageManifestsReturn } from './utils/types';
import {
  getPackageManifestResourceKey,
  getPackageManifestWatchResources,
  mapWatchResourceData,
  mapWatchResourceErrors,
} from './utils/utils';

const usePackageManifests = ({
  cluster,
  packageNames,
}: UsePackageManifestsParams): UsePackageManifestsReturn => {
  const memoizedPackageNames = useDeepCompareMemoize(packageNames);

  const packageManifestResources = useMemo(
    () => getPackageManifestWatchResources(cluster, memoizedPackageNames),
    [cluster, memoizedPackageNames],
  );

  const packageManifestData =
    useKubevirtWatchResources<Record<string, PackageManifestKind>>(packageManifestResources);

  const packageManifestResourceKeys = useMemo(
    () => memoizedPackageNames.map(getPackageManifestResourceKey),
    [memoizedPackageNames],
  );

  const packageManifests = useMemo(
    () => mapWatchResourceData(packageManifestResourceKeys, packageManifestData),
    [packageManifestData, packageManifestResourceKeys],
  );

  const loaded = useMemo(
    () => packageManifestResourceKeys.every((key) => packageManifestData?.[key]?.loaded),
    [packageManifestData, packageManifestResourceKeys],
  );

  const loadErrors = useMemo(
    () => mapWatchResourceErrors(packageManifestResourceKeys, packageManifestData),
    [packageManifestData, packageManifestResourceKeys],
  );

  return useMemo(
    () => ({ loaded, loadErrors, packageManifests }),
    [loadErrors, loaded, packageManifests],
  );
};

export default usePackageManifests;
