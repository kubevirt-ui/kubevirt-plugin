import { useMemo } from 'react';

import useClusterVersion from '@kubevirt-utils/hooks/useClusterVersion/useClusterVersion';
import { useKubevirtClusterServiceVersion } from '@kubevirt-utils/hooks/useKubevirtClusterServiceVersion';

import { getClusterMajorMinorVersion } from '../utils';

type UseVersionReadinessReturnType = (
  sourceCluster: string,
  targetCluster: string,
) => {
  error: any;
  isReady: boolean;
  loaded: boolean;
  sourceClusterVersion: string;
  sourceKubevirtVersion: string;
  targetClusterVersion: string;
  targetKubevirtVersion: string;
};

const useVersionReadiness: UseVersionReadinessReturnType = (sourceCluster, targetCluster) => {
  const {
    installedCSV: sourceInstalledCSV,
    loaded: sourceLoaded,
    loadErrors: sourceLoadErrors,
  } = useKubevirtClusterServiceVersion(sourceCluster);
  const {
    installedCSV: targetInstalledCSV,
    loaded: targetLoaded,
    loadErrors: targetLoadErrors,
  } = useKubevirtClusterServiceVersion(targetCluster);

  const [targetClusterVersion, targetClusterVersionLoaded, targetClusterVersionError] =
    useClusterVersion(targetCluster);

  const [sourceClusterVersion, sourceClusterVersionLoaded, sourceClusterVersionError] =
    useClusterVersion(sourceCluster);

  const targetClusterMajorMinorVersion = getClusterMajorMinorVersion(targetClusterVersion);
  const sourceClusterMajorMinorVersion = getClusterMajorMinorVersion(sourceClusterVersion);
  const targetInstalledCSVMajorMinorVersion = getClusterMajorMinorVersion(
    targetInstalledCSV?.spec?.version,
  );
  const sourceInstalledCSVMajorMinorVersion = getClusterMajorMinorVersion(
    sourceInstalledCSV?.spec?.version,
  );

  const isReady = useMemo(() => {
    return (
      targetClusterMajorMinorVersion === sourceClusterMajorMinorVersion &&
      targetInstalledCSVMajorMinorVersion === sourceInstalledCSVMajorMinorVersion
    );
  }, [
    targetClusterMajorMinorVersion,
    sourceClusterMajorMinorVersion,
    targetInstalledCSVMajorMinorVersion,
    sourceInstalledCSVMajorMinorVersion,
  ]);

  return {
    error:
      targetClusterVersionError ||
      sourceClusterVersionError ||
      sourceLoadErrors ||
      targetLoadErrors,
    isReady,
    loaded:
      targetClusterVersionLoaded && sourceClusterVersionLoaded && sourceLoaded && targetLoaded,
    sourceClusterVersion: sourceClusterMajorMinorVersion,
    sourceKubevirtVersion: sourceInstalledCSVMajorMinorVersion,
    targetClusterVersion: targetClusterMajorMinorVersion,
    targetKubevirtVersion: targetInstalledCSVMajorMinorVersion,
  };
};

export default useVersionReadiness;
