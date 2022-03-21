import * as React from 'react';

import { Skeleton } from '@patternfly/react-core';

const DiskSourcePVCSelectSkeleton: React.FC = () => {
  return (
    <div>
      <br />
      <Skeleton fontSize="lg" className="pvc-selection-formgroup" />
      <br />
      <Skeleton fontSize="lg" className="pvc-selection-formgroup" />
      <br />
      <br />
    </div>
  );
};

export default DiskSourcePVCSelectSkeleton;
