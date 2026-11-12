import { useEffect, useState } from 'react';

import {
  getDriverEntry,
  setDriverEntry,
  subscribeDriverCache,
} from '@kubevirt-utils/store/drivers';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { DEFAULT_INFO, getDriversInfo, VirtioWinDriversInfo } from './drivers';

export const useVirtioWinDriversInfo = (clusterParam?: string): [VirtioWinDriversInfo, boolean] => {
  const clusterParamFromURL = useClusterParam();
  const cluster = clusterParam ?? clusterParamFromURL ?? undefined;

  const [entry, setEntry] = useState(() => getDriverEntry(cluster));

  useEffect(() => {
    setEntry(getDriverEntry(cluster));
    return subscribeDriverCache(() => {
      setEntry(getDriverEntry(cluster));
    });
  }, [cluster]);

  useEffect(() => {
    if (entry) return;

    setDriverEntry(cluster, { ...DEFAULT_INFO, loading: true });

    getDriversInfo(cluster)
      .then((result) => setDriverEntry(cluster, { ...result, loading: false }))
      .catch(() => setDriverEntry(cluster, { ...DEFAULT_INFO, loading: false }));
  }, [cluster, entry]);

  return [
    entry ? { downloadURL: entry.downloadURL, image: entry.image } : DEFAULT_INFO,
    !entry || entry.loading,
  ];
};

export const useDriversImage = (clusterParam?: string): [string, boolean] => {
  const [info, loading] = useVirtioWinDriversInfo(clusterParam);
  return [info.image, loading];
};
