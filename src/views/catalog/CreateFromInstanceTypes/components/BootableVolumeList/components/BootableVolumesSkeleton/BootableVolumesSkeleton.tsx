import React, { FC } from 'react';

import { Skeleton, Stack, StackItem } from '@patternfly/react-core';

const BootableVolumesSkeleton: FC = () => (
  <Stack hasGutter>
    <StackItem />
    <StackItem>
      <Skeleton />
    </StackItem>
    <StackItem>
      <Skeleton />
    </StackItem>
    <StackItem>
      <Skeleton />
    </StackItem>
    <StackItem>
      <Skeleton />
    </StackItem>
  </Stack>
);

export default BootableVolumesSkeleton;
