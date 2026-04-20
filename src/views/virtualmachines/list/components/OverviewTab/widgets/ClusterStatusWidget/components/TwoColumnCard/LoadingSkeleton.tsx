import React, { FCC } from 'react';

import { Skeleton } from '@patternfly/react-core';

const SKELETON_ROWS = 3;

const LoadingSkeleton: FCC = () => (
  <div className="two-column-card__layout">
    <div className="two-column-card__left">
      {Array.from({ length: SKELETON_ROWS }, (_, i) => (
        <div className="two-column-card__skeleton-row" key={i}>
          <Skeleton height="1.5rem" width="60%" />
        </div>
      ))}
    </div>
    <div className="two-column-card__right">
      {Array.from({ length: SKELETON_ROWS }, (_, i) => (
        <div className="two-column-card__skeleton-row" key={i}>
          <Skeleton height="1rem" width="40%" />
          <Skeleton height="1rem" width="20%" />
        </div>
      ))}
    </div>
  </div>
);

export default LoadingSkeleton;
