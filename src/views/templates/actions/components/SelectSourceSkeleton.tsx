import React from 'react';

import { Skeleton } from '@patternfly/react-core';

const SelectSourceSkeleton: React.FC = () => (
  <>
    <br />
    <Skeleton className="select-source-option" fontSize="lg" />
    <br />
    <Skeleton className="select-source-option" fontSize="lg" />
    <br />
    <Skeleton className="select-source-option" fontSize="lg" width="50%" />
  </>
);

export default SelectSourceSkeleton;
