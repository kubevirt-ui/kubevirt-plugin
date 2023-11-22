import * as React from 'react';

import { Skeleton } from '@patternfly/react-core';

export const PersistentVolumeClainSelectSkeleton: React.FC = () => {
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
