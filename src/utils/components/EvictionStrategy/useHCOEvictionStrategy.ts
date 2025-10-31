import { useMemo } from 'react';

import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';

import { EVICTION_STRATEGY_DEFAULT } from './constants';

const useHCOEvictionStrategy = (cluster?: string) => {
  const [hyperConverge, hyperLoaded, hyperLoadingError] = useHyperConvergeConfiguration(cluster);

  return useMemo(() => {
    if (hyperLoaded && !hyperLoadingError && !hyperConverge) return EVICTION_STRATEGY_DEFAULT;

    return hyperConverge?.spec?.evictionStrategy;
  }, [hyperConverge, hyperLoaded, hyperLoadingError]);
};

export default useHCOEvictionStrategy;
