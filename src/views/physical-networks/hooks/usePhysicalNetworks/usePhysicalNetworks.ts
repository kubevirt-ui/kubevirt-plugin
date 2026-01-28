import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNNCEs from '@kubevirt-utils/resources/nnce/hooks/useNNCEs';
import useNNCPs from '@kubevirt-utils/resources/nncp/hooks/useNNCPs';
import useWorkerNodes from '@kubevirt-utils/resources/node/hooks/useWorkerNodes';

import { PhysicalNetworks } from '../../utils/types';

import { getPhysicalNetworks } from './utils/utils';

type UsePhysicalNetworks = () => {
  physicalNetworks: PhysicalNetworks;
  physicalNetworksLoaded: boolean;
};

const usePhysicalNetworks: UsePhysicalNetworks = () => {
  const { t } = useKubevirtTranslation();
  const [nncps, nncpsLoaded] = useNNCPs();
  const [nnces, nncesLoaded] = useNNCEs();
  const [nodes, nodesLoaded] = useWorkerNodes();

  const physicalNetworks = useMemo(
    () => getPhysicalNetworks(nncps, nodes, nnces, t),
    [nncps, nodes, nnces, t],
  );

  return { physicalNetworks, physicalNetworksLoaded: nncpsLoaded && nncesLoaded && nodesLoaded };
};

export default usePhysicalNetworks;
