// @ai-rules:
// 1. [Pattern]: Cluster scope for the Family availability section. Only ACM "All clusters" exposes a selector;
//    ACM single-cluster routes and standalone console keep using the URL cluster param.
// 2. [Gotcha]: `hubClusterName` loads asynchronously, so `cluster` can be undefined on first render of All clusters.
import { useCallback, useState } from 'react';

import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

type UseFamilyAvailabilityCluster = () => {
  cluster: string | undefined;
  onClusterChange: (cluster: string) => void;
  selectedCluster: string | undefined;
  showClusterSelector: boolean;
};

const useFamilyAvailabilityCluster: UseFamilyAvailabilityCluster = () => {
  const isAllClustersPage = useIsAllClustersPage();
  const clusterParam = useClusterParam();
  const [hubClusterName] = useHubClusterName();
  const [selected, setSelected] = useState<string>();

  const onClusterChange = useCallback((newCluster: string) => setSelected(newCluster), []);

  if (!isAllClustersPage) {
    return {
      cluster: clusterParam,
      onClusterChange,
      selectedCluster: undefined,
      showClusterSelector: false,
    };
  }

  const selectedCluster = selected ?? hubClusterName;

  return {
    cluster: selectedCluster,
    onClusterChange,
    selectedCluster,
    showClusterSelector: true,
  };
};

export default useFamilyAvailabilityCluster;
