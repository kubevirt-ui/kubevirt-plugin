import React, { FC } from 'react';

const CatalogSkeleton: FC = () => (
  <div className="loading-skeleton--catalog">
    <div className="skeleton-catalog--list" />
    <div className="skeleton-catalog--grid">
      {/* 12 works well because it divides evenly for 2, 3, and 4 column layouts*/}
      {Array.from({ length: 12 }, (_, idx: number) => (
        <div className="skeleton-catalog--tile" key={`skeleton-tile-${idx}`} />
      ))}
    </div>
  </div>
);

export default CatalogSkeleton;
