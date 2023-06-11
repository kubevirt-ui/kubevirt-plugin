import * as React from 'react';

import { Skeleton, Split, Stack, StackItem } from '@patternfly/react-core';

export const CustomizeVirtualMachineSkeleton = React.memo(() => (
  <Stack className="skeleton-section" data-test-id="skeleton" hasGutter>
    <StackItem />
    <Skeleton height="40px" width="80%" />
    <StackItem />
    <StackItem />
    <Skeleton height="30px" width="20%" />
    <StackItem />
    <Skeleton height="120px" width="80%" />
    <StackItem />
    <StackItem />
    <Skeleton height="30px" width="20%" />
    <StackItem />
    <Skeleton height="80px" width="80%" />
    <StackItem />
    <StackItem />
    <StackItem />
    <Split hasGutter>
      <Skeleton height="35px" width="30%" />
      <Skeleton height="35px" width="10%" />
    </Split>
  </Stack>
));
CustomizeVirtualMachineSkeleton.displayName = 'CustomizeVirtualMachineSkeleton';
