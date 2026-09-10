import type { FC, ReactNode } from 'react';
import React from 'react';

import { Flex } from '@patternfly/react-core';

const PaneHeading: FC<{ children?: ReactNode }> = ({ children }) => (
  <Flex
    alignItems={{ default: 'alignItemsCenter' }}
    justifyContent={{ default: 'justifyContentSpaceBetween' }}
  >
    {children}
  </Flex>
);

export default PaneHeading;
