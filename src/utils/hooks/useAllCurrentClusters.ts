import { useFleetClusterNames } from '@stolostron/multicluster-sdk';

import { isEmpty } from '../utils/utils';

import useListClusters from './useListClusters';

const useAllCurrentClusters = (): string[] => {
  const [allClusters] = useFleetClusterNames();
  const filteredClusters = useListClusters();
  return isEmpty(filteredClusters) ? allClusters : filteredClusters;
};

export default useAllCurrentClusters;
