import * as React from 'react';

import { Skeleton, Stack, StackItem } from '@patternfly/react-core';

import EnvironmentFormTitle from './EnvironmentFormTitle';

const EnvironmentFormSkeleton: React.FC = React.memo(() => (
  <div className="co-m-pane__body">
    <Stack hasGutter>
      <EnvironmentFormTitle />
      <StackItem />
      <Skeleton width="80%" height="40px" />
      <Skeleton width="40%" height="30px" />
    </Stack>
  </div>
));
EnvironmentFormSkeleton.displayName = 'EnvironmentFormSkeleton';

export default EnvironmentFormSkeleton;
