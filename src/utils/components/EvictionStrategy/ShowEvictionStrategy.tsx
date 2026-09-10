import type { FC } from 'react';
import React, { memo } from 'react';

import useHCOEvictionStrategy from './useHCOEvictionStrategy';

type ShowEvictionStrategyProps = {
  cluster?: string;
  evictionStrategy: string;
};

const ShowEvictionStrategy: FC<ShowEvictionStrategyProps> = ({ cluster, evictionStrategy }) => {
  const HCOEvictionStrategy = useHCOEvictionStrategy(cluster);

  if (evictionStrategy) return <>{evictionStrategy}</>;

  return <>{HCOEvictionStrategy}</>;
};

export default memo(ShowEvictionStrategy);
