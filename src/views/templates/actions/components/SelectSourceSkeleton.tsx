import React from 'react';

import { Skeleton } from '@patternfly/react-core';

const SelectSourceSkeleton: React.FC = () => (
  <>
    <br />
    <Skeleton fontSize="lg" className="select-source-option" />
    <br />
    <Skeleton fontSize="lg" className="select-source-option" />
    <br />
    <Skeleton fontSize="lg" width="50%" className="select-source-option" />
  </>
);

export default SelectSourceSkeleton;
