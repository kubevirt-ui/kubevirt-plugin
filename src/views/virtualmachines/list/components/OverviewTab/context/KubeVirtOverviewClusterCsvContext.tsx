import React, { createContext, FC, ReactNode, useContext, useMemo } from 'react';

import { useKubevirtClusterServiceVersion } from '@kubevirt-utils/hooks/useKubevirtClusterServiceVersion';

type KubeVirtOverviewClusterCsvContextValue = ReturnType<
  typeof useKubevirtClusterServiceVersion
> & {
  overviewCluster?: string;
};

const KubeVirtOverviewClusterCsvContext =
  createContext<KubeVirtOverviewClusterCsvContextValue | null>(null);

type KubeVirtOverviewClusterCsvProviderProps = {
  children: ReactNode;
  cluster?: string;
};

/**
 * Single Subscription + CSV watch for the VM overview cluster — shared by OpenShift Virtualization
 * and storage migration API discovery to avoid duplicate watches.
 */
export const KubeVirtOverviewClusterCsvProvider: FC<KubeVirtOverviewClusterCsvProviderProps> = ({
  children,
  cluster,
}) => {
  const csv = useKubevirtClusterServiceVersion(cluster);
  const value = useMemo(
    (): KubeVirtOverviewClusterCsvContextValue => ({
      ...csv,
      overviewCluster: cluster,
    }),
    [csv, cluster],
  );

  return (
    <KubeVirtOverviewClusterCsvContext.Provider value={value}>
      {children}
    </KubeVirtOverviewClusterCsvContext.Provider>
  );
};

export const useKubeVirtOverviewClusterCsv = (): KubeVirtOverviewClusterCsvContextValue => {
  const ctx = useContext(KubeVirtOverviewClusterCsvContext);
  if (!ctx) {
    throw new Error(
      'useKubeVirtOverviewClusterCsv must be used within KubeVirtOverviewClusterCsvProvider',
    );
  }
  return ctx;
};
