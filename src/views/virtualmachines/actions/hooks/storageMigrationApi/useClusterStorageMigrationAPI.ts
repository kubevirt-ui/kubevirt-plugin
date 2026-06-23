import { useKubevirtClusterServiceVersion } from '@kubevirt-utils/hooks/useKubevirtClusterServiceVersion';
import useIsACMPage from '@multicluster/useIsACMPage';

import useClusterStorageMigrationApiProbe from './useClusterStorageMigrationApiProbe';

/**
 * ACM: detects which storage migration API exists on the managed cluster (CSV + LIST probes).
 * Single-cluster console: probe short-circuits to MULTI_NS in `useClusterStorageMigrationApiProbe`
 * (CSV Subscription watch is skipped when not on an ACM page).
 * The overview widget calls `useClusterStorageMigrationApiProbe` with shared CSV context
 * to avoid duplicate Subscription/CSV watches next to OpenShift Virtualization.
 */
const useClusterStorageMigrationAPI = (cluster?: string) => {
  const isACMPage = useIsACMPage();
  const csv = useKubevirtClusterServiceVersion(isACMPage ? cluster : undefined);
  return useClusterStorageMigrationApiProbe(cluster, csv);
};

export default useClusterStorageMigrationAPI;
