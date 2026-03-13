import React, { createContext, FC, PropsWithChildren, useContext } from 'react';

type SettingsClusterContextType = {
  cluster: string | undefined;
};

const SettingsClusterContext = createContext<SettingsClusterContextType>({
  cluster: undefined,
});

export const SettingsClusterProvider: FC<PropsWithChildren<{ cluster: string | undefined }>> = ({
  children,
  cluster,
}) => (
  <SettingsClusterContext.Provider value={{ cluster }}>{children}</SettingsClusterContext.Provider>
);

export const useSettingsCluster = (): string | undefined => {
  const { cluster } = useContext(SettingsClusterContext);
  return cluster;
};

export const useIsSpokeCluster = (): boolean => {
  const cluster = useSettingsCluster();
  return Boolean(cluster);
};
