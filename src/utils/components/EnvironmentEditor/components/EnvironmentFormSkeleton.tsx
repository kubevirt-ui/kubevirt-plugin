import React, { FC, memo } from 'react';

import { Skeleton, Stack, StackItem } from '@patternfly/react-core';

import EnvironmentFormTitle from './EnvironmentFormTitle';

type EnvironmentFormSkeletonProps = {
  displayYAMLSwitcher?: boolean;
};

const EnvironmentFormSkeleton: FC<EnvironmentFormSkeletonProps> = memo(
  ({ displayYAMLSwitcher }) => (
    <>
      <Stack hasGutter>
        <EnvironmentFormTitle displayYAMLSwitcher={displayYAMLSwitcher} />
        <StackItem />
        <Skeleton width="80%" height="40px" />
        <Skeleton width="40%" height="30px" />
      </Stack>
    </>
  ),
);
EnvironmentFormSkeleton.displayName = 'EnvironmentFormSkeleton';

export default EnvironmentFormSkeleton;
