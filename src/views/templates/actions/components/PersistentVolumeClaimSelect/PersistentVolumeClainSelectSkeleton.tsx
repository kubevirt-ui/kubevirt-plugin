import React, { FC } from 'react';

import { Skeleton } from '@patternfly/react-core';

export const PersistentVolumeClainSelectSkeleton: FC = () => {
  return (
    <div>
      <br />
      <Skeleton className="pvc-selection-formgroup" fontSize="lg" />
      <br />
      <Skeleton className="pvc-selection-formgroup" fontSize="lg" />
      <br />
      <br />
    </div>
  );
};
