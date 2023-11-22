import React, { FC } from 'react';

import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';

import { EVICTION_STRATEGY_DEFAULT } from './constants';

type ShowEvictionStrategyProps = {
  evictionStrategy: string;
};

const ShowEvictionStrategy: FC<ShowEvictionStrategyProps> = ({ evictionStrategy }) => {
  const [hyperConverge, hyperLoaded, hyperLoadingError] = useHyperConvergeConfiguration();

  if (evictionStrategy) return <>{evictionStrategy}</>;

  if (hyperLoaded && !hyperLoadingError && !hyperConverge) return <>{EVICTION_STRATEGY_DEFAULT}</>;

  return <>{hyperConverge?.spec?.evictionStrategy}</>;
};

export default ShowEvictionStrategy;
