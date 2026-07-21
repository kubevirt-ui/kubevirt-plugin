import { useEffect } from 'react';

import { getDriverEntry, setDriverEntry } from '@kubevirt-utils/store/drivers';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { useSignals } from '@preact/signals-react/runtime';

import { DEFAULT_INFO, getDriversInfo, VirtioWinDriversInfo } from './drivers';

export const useVirtioWinDriversInfo = (clusterParam?: string): [VirtioWinDriversInfo, boolean] => {
  useSignals();
  const clusterParamFromURL = useClusterParam();
  const cluster = clusterParam || clusterParamFromURL;

  const entry = getDriverEntry(cluster);

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
