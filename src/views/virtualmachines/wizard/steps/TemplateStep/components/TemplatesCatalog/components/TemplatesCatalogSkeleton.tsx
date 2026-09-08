import React, { type FC } from 'react';

import { SKELETON_TILE_COUNT } from './constants';

const CatalogSkeleton: FC = () => (
  <div className="loading-skeleton--catalog">
    <div className="skeleton-catalog--list" />
    <div className="skeleton-catalog--grid">
      {/* Divides evenly for 2, 3, and 4 column layouts */}
      {Array.from({ length: SKELETON_TILE_COUNT }, (_item, idx: number) => (
        <div className="skeleton-catalog--tile" key={`skeleton-tile-${idx}`} />
      ))}
    </div>
  </div>
);

export default CatalogSkeleton;
