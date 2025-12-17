import { useEffect } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';

export type UseInitialClusterSelectionProps = {
  hubClusterName: string;
  hubClusterNameLoaded: boolean;
  includeAllClusters: boolean;
  isACMPage: boolean;
  onClusterChange: (cluster: string) => void;
  selectedCluster: string;
};

export const useInitialClusterSelection = ({
  hubClusterName,
  hubClusterNameLoaded,
  includeAllClusters,
  isACMPage,
  onClusterChange,
  selectedCluster,
}: UseInitialClusterSelectionProps): void => {
  useEffect(() => {
    if (!isACMPage) return;
    if (includeAllClusters) return;

    if (isEmpty(selectedCluster) && hubClusterNameLoaded) {
      onClusterChange(hubClusterName);
    }
  }, [
    isACMPage,
    selectedCluster,
    hubClusterName,
    hubClusterNameLoaded,
    includeAllClusters,
    onClusterChange,
  ]);
};
