import { useCallback, useState } from 'react';

import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

type UseFamilyAvailabilityCluster = () => {
  cluster: string | undefined;
  hasUserSelectedCluster: boolean;
  onClusterChange: (cluster: string) => void;
  selectedCluster: string | undefined;
  showClusterSelector: boolean;
};

const useFamilyAvailabilityCluster: UseFamilyAvailabilityCluster = () => {
  const isACMPage = useIsACMPage();
  const clusterParam = useClusterParam();
  const [hubClusterName] = useHubClusterName();
  const [selected, setSelected] = useState<string>();

  const onClusterChange = useCallback((newCluster: string) => setSelected(newCluster), []);

  if (!isACMPage) {
    return {
      cluster: clusterParam,
      hasUserSelectedCluster: false,
      onClusterChange,
      selectedCluster: undefined,
      showClusterSelector: false,
    };
  }

  const selectedCluster = selected ?? clusterParam ?? hubClusterName;

  return {
    cluster: selectedCluster,
    hasUserSelectedCluster: selected !== undefined,
    onClusterChange,
    selectedCluster,
    showClusterSelector: true,
  };
};

export default useFamilyAvailabilityCluster;
