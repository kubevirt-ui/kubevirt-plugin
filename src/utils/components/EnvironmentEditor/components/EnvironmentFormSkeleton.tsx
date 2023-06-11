import React, { FC, memo } from 'react';

import { Skeleton, Stack, StackItem } from '@patternfly/react-core';

import EnvironmentFormTitle from './EnvironmentFormTitle';

const EnvironmentFormSkeleton: FC = memo(() => (
  <Stack hasGutter>
    <EnvironmentFormTitle />
    <StackItem />
    <Skeleton height="40px" width="80%" />
    <Skeleton height="30px" width="40%" />
  </Stack>
));
EnvironmentFormSkeleton.displayName = 'EnvironmentFormSkeleton';

export default EnvironmentFormSkeleton;
