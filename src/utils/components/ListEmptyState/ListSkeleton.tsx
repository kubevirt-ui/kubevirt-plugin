import React, { FC } from 'react';

import { Flex, Skeleton, Stack, StackItem } from '@patternfly/react-core';

const LinkSkeleton: FC = () => (
  <div>
    <Stack hasGutter>
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
        <Skeleton fontSize="2xl" width="30%" />
        <Skeleton fontSize="2xl" width="30%" />
        <Skeleton fontSize="2xl" width="30%" />
      </Flex>

      <StackItem>
        <Skeleton fontSize="lg" />
      </StackItem>
      <StackItem>
        <Skeleton fontSize="lg" />
      </StackItem>
      <StackItem>
        <Skeleton fontSize="lg" />
      </StackItem>
      <StackItem>
        <Skeleton fontSize="lg" />
      </StackItem>
    </Stack>
  </div>
);

export default LinkSkeleton;
