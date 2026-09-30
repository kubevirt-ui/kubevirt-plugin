import { useMemo } from 'react';

import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { getEvictionStrategy } from '@kubevirt-utils/resources/hyperconverged/selectors';

import { EVICTION_STRATEGY_DEFAULT } from './constants';

const useHCOEvictionStrategy = (cluster?: string): string | undefined => {
  const [hyperConverge, hyperLoaded, hyperLoadingError] = useHyperConvergeConfiguration(cluster);

  return useMemo(() => {
    if (hyperLoaded && !hyperLoadingError && !hyperConverge) return EVICTION_STRATEGY_DEFAULT;

    return getEvictionStrategy(hyperConverge);
  }, [hyperConverge, hyperLoaded, hyperLoadingError]);
};

export default useHCOEvictionStrategy;
