import * as React from 'react';

import { Skeleton, Split, Stack, StackItem } from '@patternfly/react-core';

export const CustomizeVirtualMachineSkeleton = React.memo(() => (
  <Stack data-test-id="skeleton" hasGutter>
    <StackItem />
    <Skeleton width="80%" height="40px" />
    <StackItem />
    <StackItem />
    <Skeleton width="20%" height="30px" />
    <StackItem />
    <Skeleton width="80%" height="120px" />
    <StackItem />
    <StackItem />
    <Skeleton width="20%" height="30px" />
    <StackItem />
    <Skeleton width="80%" height="80px" />
    <StackItem />
    <StackItem />
    <StackItem />
    <Split hasGutter>
      <Skeleton width="30%" height="35px" />
      <Skeleton width="10%" height="35px" />
    </Split>
  </Stack>
));
CustomizeVirtualMachineSkeleton.displayName = 'CustomizeVirtualMachineSkeleton';
